from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, status, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import pymysql
import hashlib
import bcrypt
from datetime import datetime, timedelta
import jwt
from dotenv import load_dotenv
import json
import os
# Load environment variables
load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)
# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# Mount static files directory
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
DB_CONFIG = {
    "host": os.getenv('DB_HOST'),
    "user": os.getenv('DB_USER'),
    "password": os.getenv('DB_PASSWORD'),
    "db": os.getenv('DB_NAME'),
    "charset": "utf8mb4"
}

# User dependency function
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Get user from database
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("""
            SELECT id, email, name, status
            FROM users
            WHERE id = %s AND status = 'active'
        """, (user_id,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user is None:
            raise credentials_exception
            
        return user
        
    except jwt.PyJWTError:
        raise credentials_exception
    
@app.on_event("startup")
async def startup_event():
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        print("Database connection successful")
        conn.close()
    except Exception as e:
        print(f"Database connection failed: {str(e)}")
        raise e
# JWT Configuration
SECRET_KEY = "your-secret-key"  # Change this to a secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database connection
def get_db_connection():
    return pymysql.connect(**DB_CONFIG)

# Web3 setup
# w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))  # Ganache local network

# # Load smart contract ABIs
# with open('contracts/VehicleNFT.json') as f:
#     vehicle_nft_abi = json.load(f)

# with open('contracts/VehicleMarketplace.json') as f:
#     marketplace_abi = json.load(f)

# # Contract addresses (deploy these first and update these addresses)
# VEHICLE_NFT_ADDRESS = "YOUR_DEPLOYED_NFT_CONTRACT_ADDRESS"
# MARKETPLACE_ADDRESS = "YOUR_DEPLOYED_MARKETPLACE_ADDRESS"

# # Initialize contract instances
# vehicle_nft_contract = w3.eth.contract(address=VEHICLE_NFT_ADDRESS, abi=vehicle_nft_abi)
# marketplace_contract = w3.eth.contract(address=MARKETPLACE_ADDRESS, abi=marketplace_abi)

class VehicleListing(BaseModel):
    title: str
    description: str
    price: float
    saleType: str
    auctionDuration: Optional[int]
    startingBid: Optional[float]
    images: List[UploadFile]

# Models
class Vehicle(BaseModel):
    vin: str
    make: str
    model: str
    year: int
    price: float
    description: str
    owner_address: str

class ServiceRecord(BaseModel):
    vehicle_id: int
    service_type: str
    description: str
    mileage: int
    service_center_id: str
    documents: List[str]

# User Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Authentication functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


# Test database connection function
@app.get("/api/test-connection")
async def test_connection():
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        conn.close()
        return {"status": "success", "message": "Database connection successful"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection failed: {str(e)}"
        )

# Health check endpoint
@app.get("/")
async def health_check():
    return {"status": "healthy", "message": "Server is running"}

@app.post("/api/vehicles")
async def create_vehicle_listing(
    title: str = Form(...),
    description: str = Form(...),
    price: str = Form(...),
    make: str = Form(...),
    model: str = Form(...),
    year: str = Form(...),
    mileage: str = Form(...),
    fuel_type: str = Form(...),
    transmission: str = Form(...),
    color: str = Form(...),
    location: str = Form(...),
    saleType: str = Form(...),
    auctionDuration: Optional[str] = Form(None),
    startingBid: Optional[str] = Form(None),
    images: List[UploadFile] = File(...)
):
    try:
        # Convert string values to appropriate types
        price_float = float(price) if price else 0.0
        year_int = int(year) if year else 0
        mileage_int = int(mileage) if mileage else 0
        auction_duration_int = int(auctionDuration) if auctionDuration else None
        starting_bid_float = float(startingBid) if startingBid else None

        # Database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            # Insert vehicle listing
            sql = """
            INSERT INTO vehicle_listings 
            (title, description, price, make, model, year, mileage,
             fuel_type, transmission, color, location, sale_type, 
             auction_duration, starting_bid, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            cursor.execute(sql, (
                title,
                description,
                price_float,
                make,
                model,
                year_int,
                mileage_int,
                fuel_type,
                transmission,
                color,
                location,
                saleType,
                auction_duration_int,
                starting_bid_float,
                datetime.now()
            ))
            
            # Get the ID of the newly created vehicle listing
            vehicle_id = cursor.lastrowid

            # Define base paths
            base_upload_dir = os.path.abspath("uploads")
            vehicles_dir = os.path.join(base_upload_dir, "vehicles")
            vehicle_dir = os.path.join(vehicles_dir, str(vehicle_id))
            images_dir = os.path.join(vehicle_dir, "images")

            # Create directory structure
            os.makedirs(base_upload_dir, exist_ok=True)
            os.makedirs(vehicles_dir, exist_ok=True)
            os.makedirs(vehicle_dir, exist_ok=True)
            os.makedirs(images_dir, exist_ok=True)

            # Save images and update database
            saved_images = []
            for idx, image in enumerate(images):
                try:
                    # Get file extension, default to .jpg if none
                    ext = os.path.splitext(image.filename)[1].lower() or '.jpg'
                    filename = f"image_{idx}{ext}"
                    
                    # Full path for saving the file
                    file_path = os.path.join(images_dir, filename)
                    
                    # Relative path for database and URL (from uploads directory)
                    rel_path = os.path.join("vehicles", str(vehicle_id), "images", filename).replace("\\", "/")
                    
                    # Save the file
                    contents = await image.read()
                    with open(file_path, "wb") as f:
                        f.write(contents)
                    
                    # Insert image record into database
                    cursor.execute(
                        "INSERT INTO vehicle_images (vehicle_id, image_path, image_order, created_at) VALUES (%s, %s, %s, %s)",
                        (vehicle_id, rel_path, idx, datetime.now())
                    )
                    
                    # Add to saved images list
                    saved_images.append({
                        "path": rel_path,
                        "url": f"/uploads/{rel_path}"
                    })
                    
                except Exception as img_error:
                    print(f"Error saving image {idx}: {str(img_error)}")
                    # Continue with next image if one fails
                    continue

            # Commit database changes
            conn.commit()

            # Return success response
            return {
                "success": True,
                "vehicle_id": vehicle_id,
                "images": saved_images,
                "message": "Vehicle listing created successfully"
            }

        except Exception as db_error:
            # Rollback in case of database error
            conn.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(db_error)}"
            )

    except Exception as e:
        print(f"Error creating listing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating vehicle listing: {str(e)}"
        )
    
    finally:
        # Close database connection
        if 'conn' in locals():
            conn.close()

@app.post("/api/vehicles/{token_id}/images")
async def upload_vehicle_images(token_id: int, files: List[UploadFile] = File(...)):
    try:
        image_hashes = []
        for file in files:
            # Read and hash file content
            content = await file.read()
            file_hash = hashlib.sha256(content).hexdigest()
            
            # Save file
            file_path = f"uploads/{token_id}/{file_hash}.jpg"
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Store in database
            conn = get_db_connection()
            cursor = conn.cursor()
            sql = """INSERT INTO vehicle_images 
                    (token_id, image_hash, image_path) 
                    VALUES (%s, %s, %s)"""
            cursor.execute(sql, (token_id, file_hash, file_path))
            conn.commit()
            
            image_hashes.append(file_hash)
            
        return {"success": True, "image_hashes": image_hashes}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/vehicles")
async def get_vehicles():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        query = """
            SELECT v.*, 
                   GROUP_CONCAT(vi.image_path) as image_paths
            FROM vehicle_listings v
            LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
            GROUP BY v.id
            ORDER BY v.created_at DESC
        """
        cursor.execute(query)
        vehicles = cursor.fetchall()
        
        formatted_vehicles = []
        for vehicle in vehicles:
            vehicle_data = dict(vehicle)
            if vehicle_data['image_paths']:
                paths = vehicle_data['image_paths'].split(',')
                vehicle_data['images'] = [
                    {
                        "path": path,
                        "url": f"/uploads{path}"
                    } for path in paths if path
                ]
            else:
                vehicle_data['images'] = []
            del vehicle_data['image_paths']
            formatted_vehicles.append(vehicle_data)
            
        return formatted_vehicles
        
    except Exception as e:
        print(f"Error fetching vehicles: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if 'conn' in locals():
            conn.close()

@app.get("/api/vehicles/{token_id}")
async def get_vehicle(token_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Get vehicle data
        cursor.execute("SELECT * FROM vehicles WHERE token_id = %s", (token_id,))
        vehicle = cursor.fetchone()
        
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
            
        # Get images
# Get images
        cursor.execute("SELECT image_hash, image_path FROM vehicle_images WHERE token_id = %s", (token_id,))
        images = cursor.fetchall()
        vehicle['images'] = images
        
        # Get service records
        cursor.execute("SELECT * FROM service_records WHERE token_id = %s ORDER BY service_date DESC", (token_id,))
        service_records = cursor.fetchall()
        vehicle['service_records'] = service_records
        
        # Get blockchain data
        blockchain_data = vehicle_nft_contract.functions.getVehicle(token_id).call()
        vehicle['blockchain_price'] = blockchain_data[5]
        vehicle['is_for_sale'] = blockchain_data[6]
        
        return vehicle
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/vehicles/{token_id}/service-records")
async def add_service_record(token_id: int, record: ServiceRecord):
    try:
        # Add to blockchain
        tx_hash = vehicle_history_contract.functions.addServiceRecord(
            token_id,
            record.service_type,
            record.description,
            record.mileage,
            ""  # document URI
        ).transact({'from': record.service_center_id})
        
        # Wait for transaction receipt
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Store in database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = """INSERT INTO service_records 
                (token_id, service_type, description, mileage, service_center_id) 
                VALUES (%s, %s, %s, %s, %s)"""
                
        cursor.execute(sql, (
            token_id,
            record.service_type,
            record.description,
            record.mileage,
            record.service_center_id
        ))
        
        conn.commit()
        return {"success": True}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/vehicles/{token_id}/sell")
async def list_vehicle_for_sale(token_id: int, price: float, seller_address: str):
    try:
        # Convert price to wei
        price_wei = int(price * 1e18)
        
        # Approve marketplace contract
        tx_hash = vehicle_nft_contract.functions.approve(
            MARKETPLACE_ADDRESS,
            token_id
        ).transact({'from': seller_address})
        
        w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # List on marketplace
        tx_hash = marketplace_contract.functions.listVehicle(
            token_id,
            price_wei
        ).transact({'from': seller_address})
        
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return {"success": True}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/vehicles/{token_id}/buy")
async def buy_vehicle(token_id: int, buyer_address: str):
    try:
        # Get listing price
        listing = marketplace_contract.functions.listings(token_id).call()
        
        # Buy vehicle
        tx_hash = marketplace_contract.functions.buyVehicle(
            token_id
        ).transact({
            'from': buyer_address,
            'value': listing[1]  # price in wei
        })
        
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Update database
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = "UPDATE vehicles SET owner_address = %s WHERE token_id = %s"
        cursor.execute(sql, (buyer_address, token_id))
        
        conn.commit()
        return {"success": True}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# Authentication endpoints
@app.post("/api/register", response_model=dict)
async def register_user(user: UserCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash password
        hashed_password = get_password_hash(user.password)
        
        # Get current timestamp
        current_time = datetime.utcnow()

        # Insert user
        sql = """
        INSERT INTO users (name, email, password_hash, phone, join_date, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            user.name,
            user.email,
            hashed_password,
            user.phone,
            current_time,
            current_time,
            current_time
        ))

        user_id = cursor.lastrowid

        # Insert default settings
        default_preferences = json.dumps({
            'email_notifications': True,
            'push_notifications': True,
            'bid_alerts': True,
            'price_updates': True,
            'newsletter': True
        })

        sql = """
        INSERT INTO user_settings (user_id, notification_preferences, theme_preference,
                                 language_preference, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            user_id,
            default_preferences,
            'system',
            'en',
            current_time,
            current_time
        ))

        conn.commit()
        
        return {
            "success": True,
            "message": "Registration successful",
            "userId": user_id
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        conn.close()

@app.get("/uploads/{path:path}")
async def serve_upload(path: str):
    full_path = os.path.join("uploads", path)
    if os.path.exists(full_path):
        return FileResponse(full_path)
    return {"error": "File not found"}, 404

@app.post("/api/login", response_model=dict)
async def login(user: UserLogin):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        # Get user
        cursor.execute("""
            SELECT id, email, name, password_hash, status
            FROM users
            WHERE email = %s AND status = 'active'
        """, (user.email,))
        
        db_user = cursor.fetchone()
        
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not verify_password(user.password, db_user['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Create access token
        access_token = create_access_token(
            data={"sub": str(db_user['id'])}
        )

        # Update last login
        cursor.execute("""
            UPDATE users
            SET last_login = NOW()
            WHERE id = %s
        """, (db_user['id'],))
        
        conn.commit()

        return {
            "success": True,
            "user": {
                "id": db_user['id'],
                "email": db_user['email'],
                "name": db_user['name']
            },
            "access_token": access_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        conn.close()
# Add these routes to main.py

@app.get("/api/vehicles/{vin}/history")
async def get_vehicle_history(vin: str):
    try:
        # Initialize Web3 and contract
        w3 = Web3(Web3.HTTPProvider(os.getenv('GANACHE_URL')))
        with open('VehicleHistory.json') as f:
            contract_json = json.load(f)
        contract_address = os.getenv('VEHICLE_HISTORY_CONTRACT_ADDRESS')
        contract = w3.eth.contract(address=contract_address, abi=contract_json['abi'])

        # Fetch all records from blockchain
        service_records = contract.functions.getServiceRecords(vin).call()
        accident_records = contract.functions.getAccidentRecords(vin).call()
        ownership_records = contract.functions.getOwnershipRecords(vin).call()
        violation_records = contract.functions.getViolationRecords(vin).call()

        # Format the response
        return {
            "serviceRecords": [
                {
                    "timestamp": record[0],
                    "serviceType": record[1],
                    "description": record[2],
                    "serviceCenter": record[3],
                    "documentHash": record[4]
                }
                for record in service_records
            ],
            "accidentRecords": [
                {
                    "timestamp": record[0],
                    "description": record[1],
                    "severity": record[2],
                    "documentHash": record[3]
                }
                for record in accident_records
            ],
            "ownershipRecords": [
                {
                    "owner": record[0],
                    "timestamp": record[1],
                    "documentHash": record[2]
                }
                for record in ownership_records
            ],
            "violationRecords": [
                {
                    "timestamp": record[0],
                    "violationType": record[1],
                    "description": record[2],
                    "documentHash": record[3]
                }
                for record in violation_records
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/vehicles/{vin}/service-records")
async def add_service_record(
    vin: str,
    serviceType: str = Form(...),
    description: str = Form(...),
    mileage: str = Form(...),
    documents: List[UploadFile] = File(None)
):
    try:
        print(f"Received request for VIN: {vin}")
        print(f"Service Type: {serviceType}")
        print(f"Description: {description}")
        print(f"Mileage: {mileage}")
        
        # Parse mileage to integer
        try:
            mileage_int = int(mileage)
        except ValueError:
            raise HTTPException(
                status_code=422,
                detail="Mileage must be a valid number"
            )

        # Create uploads directory
        upload_dir = f"uploads/service-records/{vin}"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save documents
        document_paths = []
        if documents:
            for doc in documents:
                file_path = f"{upload_dir}/{doc.filename}"
                contents = await doc.read()
                with open(file_path, "wb") as f:
                    f.write(contents)
                document_paths.append(file_path)

        # Get current timestamp
        current_time = datetime.utcnow()
        
        # Insert service record
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = """
            INSERT INTO service_records 
            (vin, service_type, description, mileage, document_paths, created_at, updated_at, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(sql, (
            vin,
            serviceType,
            description,
            mileage_int,
            ','.join(document_paths) if document_paths else None,
            current_time,
            current_time,
            'pending'
        ))
        
        conn.commit()
        
        return {
            "success": True,
            "message": "Service record added successfully",
            "documentPaths": document_paths
        }

    except Exception as e:
        print(f"Error adding service record: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    finally:
        if 'conn' in locals():
            conn.close()
# Add to main.py
@app.get("/api/vehicles/details/{id}")
async def get_vehicle_details(id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Updated query to use vehicle_listings table
        cursor.execute("""
            SELECT vl.*, GROUP_CONCAT(vi.image_path) as image_paths
            FROM vehicle_listings vl
            LEFT JOIN vehicle_images vi ON vl.id = vi.vehicle_id
            WHERE vl.id = %s
            GROUP BY vl.id
        """, (id,))
        
        vehicle = cursor.fetchone()
        
        if not vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )
            
        # Transform image paths into proper URLs
        if vehicle['image_paths']:
            paths = vehicle['image_paths'].split(',')
            vehicle['images'] = [
                {
                    "path": path,
                    "url": f"/uploads{path}"
                } for path in paths if path
            ]
        else:
            vehicle['images'] = []
        
        del vehicle['image_paths']
        
        return {
            "success": True,
            "data": vehicle
        }
        
    except Exception as e:
        print(f"Error fetching vehicle details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        if 'conn' in locals():
            conn.close()

@app.get("/api/test-db")
async def test_db_connection():
    try:
        conn = pymysql.connect(**DB_CONFIG)
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        conn.close()
        return {"status": "success", "message": "Database connection successful"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
async def upload_to_ipfs(content: bytes) -> str:
    """Helper function to upload content to IPFS"""
    try:
        # You'll need to set up your IPFS connection
        # This is just a placeholder - implement actual IPFS upload
        # You can use ipfs-http-client library
        import ipfshttpclient
        client = ipfshttpclient.connect()
        res = client.add(content)
        return res['Hash']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"IPFS upload failed: {str(e)}")
    
@app.post("/api/vehicles")
async def create_vehicle_listing(
    title: str = Form(...),
    description: str = Form(...),
    price: str = Form(...),
    make: str = Form(...),
    model: str = Form(...),
    year: str = Form(...),
    mileage: str = Form(...),
    fuel_type: str = Form(...),
    transmission: str = Form(...),
    color: str = Form(...),
    location: str = Form(...),
    saleType: str = Form(...),
    auctionDuration: Optional[str] = Form(None),
    startingBid: Optional[str] = Form(None),
    images: List[UploadFile] = File(...)
):
    try:
        # Convert string values to appropriate types
        price_float = float(price) if price else 0.0
        year_int = int(year) if year else 0
        mileage_int = int(mileage) if mileage else 0
        auction_duration_int = int(auctionDuration) if auctionDuration else None
        starting_bid_float = float(startingBid) if startingBid else None

        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert vehicle listing
        sql = """
        INSERT INTO vehicle_listings 
        (title, description, price, make, model, year, mileage,
         fuel_type, transmission, color, location, sale_type, 
         auction_duration, starting_bid, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(sql, (
            title,
            description,
            price_float,
            make,
            model,
            year_int,
            mileage_int,
            fuel_type,
            transmission,
            color,
            location,
            saleType,
            auction_duration_int,
            starting_bid_float,
            datetime.now()
        ))
        
        vehicle_id = cursor.lastrowid

        # Create base uploads directory if it doesn't exist
        base_uploads_dir = os.path.join(os.getcwd(), 'uploads')
        os.makedirs(base_uploads_dir, exist_ok=True)

        # Create vehicles directory if it doesn't exist
        vehicles_dir = os.path.join(base_uploads_dir, 'vehicles')
        os.makedirs(vehicles_dir, exist_ok=True)

        # Create vehicle-specific directory
        vehicle_dir = os.path.join(vehicles_dir, str(vehicle_id))
        os.makedirs(vehicle_dir, exist_ok=True)

        # Save images and update database
        saved_images = []
        for idx, image in enumerate(images):
            try:
                # Create filename with original extension
                ext = os.path.splitext(image.filename)[1].lower() or '.jpg'
                filename = f"image_{idx}{ext}"
                
                # Full file path for saving
                file_path = os.path.join(vehicle_dir, filename)
                
                # Relative path for database and URL
                rel_path = f'/vehicles/{vehicle_id}/{filename}'
                
                # Save the file
                print(f"Saving file to: {file_path}")  # Debug print
                contents = await image.read()
                with open(file_path, "wb") as f:
                    f.write(contents)
                
                # Save to database
                cursor.execute(
                    "INSERT INTO vehicle_images (vehicle_id, image_path) VALUES (%s, %s)",
                    (vehicle_id, rel_path)
                )
                
                saved_images.append({
                    "path": rel_path,
                    "url": f"/uploads{rel_path}"
                })
                print(f"Saved image: {rel_path}")  # Debug print
                
            except Exception as e:
                print(f"Error saving image {idx}: {str(e)}")
                continue

        conn.commit()
        
        return {
            "success": True,
            "vehicle_id": vehicle_id,
            "images": saved_images
        }

    except Exception as e:
        print(f"Error creating listing: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    finally:
        if 'conn' in locals():
            conn.close()
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
