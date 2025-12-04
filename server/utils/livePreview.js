import { createCanvas, loadImage } from "canvas";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

// Extracts first frame from video & save as thumbnail
export function extractFirstFrame(videoPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .on("end", () => resolve(outputPath))
            .on("error", reject)
            .screenshots({
                count: 1,
                filename: path.basename(outputPath),
                folder: path.dirname(outputPath),
                size: "480x?"
            });
    });
}

// Convert hex to RGB
function hexToRGB(hex) {
    hex = hex.replace("#", "");
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
    };
}

// Euclidean color distance
function colorDistance(r, g, b, target) {
    return Math.sqrt(
        (r - target.r) ** 2 + (g - target.g) ** 2 + (b - target.b) ** 2
    );
}

// Create preview binary image + draw centroid
export async function createBinarizedPreview(imagePath, hexColor, threshold) {
    const img = await loadImage(imagePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;
    const target = hexToRGB(hexColor);
    const scaledThreshold = threshold * 1.7;


    let sumX = 0, sumY = 0, count = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];

        const dist = colorDistance(r, g, b, target);
        const isWhite = dist < scaledThreshold;
        const pixelIndex = i / 4;
        const x = pixelIndex % img.width;
        const y = Math.floor(pixelIndex / img.width);

        if (isWhite) {
            data[i] = data[i + 1] = data[i + 2] = 255;
            data[i + 3] = 255;
            sumX += x;
            sumY += y;
            count++;
        } else {
            data[i] = data[i + 1] = data[i + 2] = 0;
            data[i + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw centroid
    if (count > 0) {
        const cx = Math.floor(sumX / count);
        const cy = Math.floor(sumY / count);

        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

    }

    return {
        buffer: canvas.toBuffer("image/png"),
        centroid: count > 0 ? { x: Math.floor(sumX / count), y: Math.floor(sumY / count) } : null
    };

}
