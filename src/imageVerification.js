import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

export class ImageVerificationService {
    constructor() {
        this.model = null;
    }

    async initialize() {
        this.model = await mobilenet.load();
    }

    async verifyImage(imageElement) {
        if (!this.model) await this.initialize();

        // Classify the image
        const predictions = await this.model.classify(imageElement);

        // Check if the image contains a car
        const carRelatedLabels = ['car', 'vehicle', 'automobile', 'truck', 'suv'];
        return predictions.some(p => 
            carRelatedLabels.some(label => 
                p.className.toLowerCase().includes(label)
            )
        );
    }

    async compareImages(image1, image2) {
        // Convert images to tensors
        const tensor1 = tf.browser.fromPixels(image1);
        const tensor2 = tf.browser.fromPixels(image2);

        // Normalize and resize images
        const normalized1 = this.preprocessImage(tensor1);
        const normalized2 = this.preprocessImage(tensor2);

        // Calculate similarity score
        const similarity = tf.metrics.cosineProximity(normalized1, normalized2).arraySync();

        // Cleanup
        tensor1.dispose();
        tensor2.dispose();
        normalized1.dispose();
        normalized2.dispose();

        return similarity;
    }

    preprocessImage(tensor) {
        return tf.tidy(() => {
            const resized = tf.image.resizeBilinear(tensor, [224, 224]);
            const normalized = resized.div(255.0);
            return normalized.expandDims(0);
        });
    }
}