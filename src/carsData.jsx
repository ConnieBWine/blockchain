import Audi1 from "./assets/images/Audi1.jpg";
import Ducati1 from './assets/images/speed_triple.jpg';
import Z1000 from './assets/images/z1000.jpg';
import Supra1 from './assets/images/supra.jpg';
import F40 from './assets/images/f40.jpg';
import F8 from './assets/images/ferrari_f8.jpg';
import H2 from './assets/images/H2.jpg';
import jeep1 from './assets/images/jeep1.jpg';
import user from './assets/images/user_avatar.jpg';
import Lamborghini from './assets/images/Lambo1.jpg';
import Bentley1 from './assets/images/bentley1.jpg';
import Rx7 from './assets/images/rx7.jpg';
import Triumph from './assets/images/Triumph.jpg';
import Range_Rover from './assets/images/range_rover1.jpg';
import Vitpilen401 from './assets/images/Vitpilen401.jpg';
import Duke390 from './assets/images/Duke390.jpg';
import RC390 from './assets/images/rc390.jpg';
import superduke1390 from './assets/images/superduke1390.jpg';
import Husqvarna701 from './assets/images/Husqvarna701.jpg';
import ZX10r from './assets/images/zx10r.jpg';
import Z900 from './assets/images/z900.jpg';
import w650 from './assets/images/w650.jpg';
import G800 from './assets/images/G800.jpg';
import G700 from './assets/images/G700.jpg';
import G650 from './assets/images/G650.jpg';
import Cirrus from './assets/images/CirrusVision.jpg';
import Cobalt from './assets/images/colbalt.jpg';
const carsData = [
    {
        id: '1',
        name: "Audi's R8 Green",
        title: "Audi R8 Green Premium Sport",
        style: 'Audi',
        type: 'Auto',
        color: 'Black',
        price: 285892,
        image: Audi1,
        images: [Audi1, Audi1, Audi1, Audi1],
        description: 'Pristine condition Audi R8 with premium features including advanced navigation system, premium leather interior, and sport performance package. Recent maintenance completed, all service records available.',
        specifications: {
            make: 'Audi',
            model: 'R8',
            year: 2023,
            mileage: 15000,
            fuel: 'Petrol',
            transmission: 'Automatic'
        },
        seller: {
            id: 'seller1',
            name: 'James Wilson',
            rating: 4.8,
            totalRatings: 156,
            joinDate: '2020',
            avatar: user
        },
        location: 'Munich, Germany',
        createdAt: '2024-03-15T10:00:00Z'
    },
    {
        id: '2',
        name: "Ducati Speed Triple",
        title: "Ducati Speed Triple Racing Edition",
        style: 'Ducati',
        type: 'Petrol',
        color: 'Black',
        price: 358174,
        image: Ducati1,
        images: [Ducati1, Ducati1, Ducati1, Ducati1],
        description: 'High-performance Ducati Speed Triple with racing modifications. Includes premium exhaust system, racing ECU, and professional maintenance history. Perfect for both track and street use.',
        specifications: {
            make: 'Ducati',
            model: 'Speed Triple',
            year: 2023,
            mileage: 8000,
            fuel: 'Petrol',
            transmission: 'Manual'
        },
        seller: {
            id: 'seller2',
            name: 'Michael Ferrari',
            rating: 4.9,
            totalRatings: 203,
            joinDate: '2019',
            avatar: user
        },
        location: 'Bologna, Italy',
        createdAt: '2024-03-14T15:30:00Z'
    },
    {
        id: '3',
        name: "Kawasaki Z1000",
        title: "Kawasaki Z1000 Street Fighter",
        style: 'Kawasaki',
        type: 'Petrol',
        color: 'Green',
        price: 358174,
        image: Z1000,
        images: [Z1000, Z1000, Z1000, Z1000],
        description: 'Powerful Kawasaki Z1000 in excellent condition. Features include ABS, traction control, and multiple riding modes. Complete service history available.',
        specifications: {
            make: 'Kawasaki',
            model: 'Z1000',
            year: 2023,
            mileage: 12000,
            fuel: 'Petrol',
            transmission: 'Manual'
        },
        seller: {
            id: 'seller3',
            name: 'Takashi Yamamoto',
            rating: 4.7,
            totalRatings: 142,
            joinDate: '2021',
            avatar: user
        },
        location: 'Tokyo, Japan',
        createdAt: '2024-03-13T08:45:00Z'
    },
    {
        id: '4',
        name: "Supra",
        title: "Toyota Supra GR Performance",
        style: 'Toyota',
        type: 'Petrol',
        color: 'Orange',
        price: 358174,
        image: Supra1,
        images: [Supra1, Supra1, Supra1, Supra1],
        description: 'Iconic Toyota Supra GR with premium upgrades. Features include custom exhaust, performance tuning, and premium audio system. Maintained to the highest standards.',
        specifications: {
            make: 'Toyota',
            model: 'Supra',
            year: 2023,
            mileage: 18000,
            fuel: 'Petrol',
            transmission: 'Automatic'
        },
        seller: {
            id: 'seller4',
            name: 'David Chen',
            rating: 4.6,
            totalRatings: 98,
            joinDate: '2022',
            avatar: user
        },
        location: 'Nagoya, Japan',
        createdAt: '2024-03-12T14:20:00Z'
    },
    {
        id: '5',
        name: "Ferrari F40",
        title: "Ferrari F40 Classic Supercar",
        style: 'Ferrari',
        type: 'Petrol',
        color: 'Red',
        price: 358174,
        image: F40,
        images: [F40, F40, F40, F40],
        description: 'Legendary Ferrari F40 in pristine condition. Original paintwork, complete service history, and recent major service. ',
        specifications: {
            make: 'Ferrari',
            model: 'F40',
            year: 1992,
            mileage: 25000,
            fuel: 'Petrol',
            transmission: 'Manual'
        },
        seller: {
            id: 'seller5',
            name: 'Alessandro Romano',
            rating: 5.0,
            totalRatings: 87,
            joinDate: '2018',
            avatar: user
        },
        location: 'Maranello, Italy',
        createdAt: '2024-03-11T11:15:00Z'
    },
    {
        id: '6',
        name: "Ferrari F8",
        title: "Ferrari F8 Tributo",
        style: 'Ferrari',
        type: 'Petrol',
        color: 'Red',
        price: 358174,
        image: F8,
        images: [F8, F8, F8, F8],
        description: 'Stunning Ferrari F8 Tributo with all optional extras. Features carbon fiber package, premium sound system, and track telemetry. Full Ferrari service history.',
        specifications: {
            make: 'Ferrari',
            model: 'F8',
            year: 2023,
            mileage: 5000,
            fuel: 'Petrol',
            transmission: 'Automatic'
        },
        seller: {
            id: 'seller6',
            name: 'Marco Bellucci',
            rating: 4.9,
            totalRatings: 134,
            joinDate: '2019',
            avatar: user
        },
        location: 'Maranello, Italy',
        createdAt: '2024-03-10T09:30:00Z'
    },
    {
        id: '7',
        name: "Kawasaki H2",
        title: "Kawasaki Ninja H2 Supercharged",
        style: 'Kawasaki',
        type: 'Petrol',
        color: 'Brown',
        price: 358174,
        image: H2,
        images: [H2, H2, H2, H2],
        description: 'Supercharged Kawasaki H2 with incredible performance. Features include advanced electronics package, custom exhaust, and premium suspension setup.',
        specifications: {
            make: 'Kawasaki',
            model: 'H2',
            year: 2023,
            mileage: 3000,
            fuel: 'Petrol',
            transmission: 'Manual'
        },
        seller: {
            id: 'seller7',
            name: 'Kenji Nakamura',
            rating: 4.8,
            totalRatings: 92,
            joinDate: '2020',
            avatar: user
        },
        location: 'Tokyo, Japan',
        createdAt: '2024-03-09T16:20:00Z'
    },
    {
        id: '8',
        name: "Jeep",
        title: "Jeep Wrangler Rubicon",
        style: 'Jeep',
        type: 'Petrol',
        color: 'Brown',
        price: 358174,
        image: jeep1,
        images: [jeep1, jeep1, jeep1, jeep1],
        description: 'Fully equipped Jeep Wrangler Rubicon ready for any adventure. Includes lift kit, off-road tires, and premium interior package.',
        specifications: {
            make: 'Jeep',
            model: 'Wrangler',
            year: 2023,
            mileage: 20000,
            fuel: 'Petrol',
            transmission: 'Automatic'
        },
        seller: {
            id: 'seller8',
            name: 'John Adams',
            rating: 4.7,
            totalRatings: 156,
            joinDate: '2021',
            avatar: user
        },
        location: 'Colorado, USA',
        createdAt: '2024-03-08T13:45:00Z'
    },
    {
        id: '9',
        name: "Lamborghini Aventador",
        title: "Lamborghini Aventador SVJ",
        style: 'Lamborghini',
        type: 'Petrol',
        color: 'Black',
        price: 358174,
        image: Lamborghini,
        images: [Lamborghini, Lamborghini, Lamborghini, Lamborghini],
        description: 'Limited edition Lamborghini Aventador SVJ with track package. Features include carbon ceramic brakes, telemetry system, and custom interior.',
        specifications: {
            make: 'Lamborghini',
            model: 'Aventador',
            year: 2023,
            mileage: 2000,
            fuel: 'Petrol',
            transmission: 'Automatic'
        },
        seller: {
            id: 'seller9',
            name: 'Giorgio Rossi',
            rating: 5.0,
            totalRatings: 178,
            joinDate: '2017',
            avatar: user
        },
        location: "Sant'Agata Bolognese, Italy",
        createdAt: '2024-03-07T10:15:00Z'
    },
    {
        id: '10',
        name: "Bentley",
        title: "Bentley Continental GT Speed",
        style: 'Bentley',
        type: 'Petrol',
        color: 'Black',
        price: 358174,
        image: Bentley1,
        images: [Bentley1, Bentley1, Bentley1, Bentley1],
        description: 'Elegant Bentley Continental GT Speed with all luxury options. Features include massage seats, premium audio, and night vision.',
        specifications: {
            make: 'Bentley',
            model: 'Continental GT',
            year: 2023,
            mileage: 10000,
            fuel: 'Petrol',
            transmission: 'Automatic'
        },
        seller: {
            id: 'seller10',
            name: 'William Spencer',
            rating: 4.9,
            totalRatings: 145,
            joinDate: '2019',
            avatar: user
        },
        location: 'London, UK',
        createdAt: '2024-03-06T09:30:00Z'
    },
    {
        id: '11',
        name: "Mazda Rx7",
        title: "Mazda RX7 Spirit R",
        style: 'Mazda',
        type: 'Petrol',
        color: 'Orange and Black',
        price: 358174,
        image: Rx7,
        images: [Rx7, Rx7, Rx7, Rx7],
        description: 'Rare Mazda RX7 Spirit R in collector condition. Features include upgraded turbo system, custom suspension, and modern entertainment system.',
        specifications: {
            make: 'Mazda',
            model: 'RX7',
            year: 2002,
            mileage: 50000,
            fuel: 'Petrol',
            transmission: 'Manual'
        },
        seller: {
            id: 'seller11',
            name: 'Hiroshi Tanaka',
            rating: 4.8,
            totalRatings: 167,
            joinDate: '2018',
            avatar: user
        },
        location: 'Hiroshima, Japan',
        createdAt: '2024-03-05T14:20:00Z'
    },
    {
        id: '12',
        name: "Triumph",
        title: "Triumph Street Triple RS",
        style: 'Triumph',
        type: 'Petrol',
        color: 'Black',
        price: 358174,
        image: Triumph,
        images: [Triumph, Triumph, Triumph, Triumph],
        description: 'Top-spec Triumph Street Triple RS with track package. Features include Öhlins suspension, quick-shifter, and premium electronics package.',
        specifications: {
            make: 'Triumph',
            model: 'Street Triple',
            year: 2023,
            mileage: 5000,
            fuel: 'Petrol',
            transmission: 'Manual'
        },
        seller: {
            id: 'seller12',
            name: 'James Harrison',
            rating: 4.7,
            totalRatings: 123,
            joinDate: '2020',
            avatar: user
        },
        location: 'London, UK',
        createdAt: '2024-03-04T11:30:00Z'
    },
    {
        id: '13',
        name: "Range Rover",
        title: "Range Rover Autobiography",
        style: 'Range Rover',
        type: 'Petrol',
        color: 'Black',
        price: 358174,
        image: Range_Rover,
        images: [Range_Rover, Range_Rover, Range_Rover, Range_Rover],
        description: 'Luxurious Range Rover Autobiography with extended wheelbase. Features include executive rear seats, refrigerator compartment, and premium entertainment system.',
        specifications: {
            make: 'Range Rover',
            model: 'Autobiography',
            year: 2023,
            mileage: 15000,
            fuel: 'Petrol',
            transmission: 'Automatic'
        },
        seller: {
            id: 'seller13',
            name: 'Charles Windsor',
            rating: 4.9,
            totalRatings: 189,
            joinDate: '2019',
            avatar: user
        },
        location: 'London, UK',
        createdAt: '2024-03-03T12:45:00Z'
    }
];

export default carsData;