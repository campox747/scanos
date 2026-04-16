import { useState, useEffect } from "react";
function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("Timeout after " + ms + " ms"));
    }, ms);
    promise.then(resolve, reject);
  });
}

export function VideoFeed({ status }) {
  const imgUrl = "http://10.10.10.1/camera_stream";
  //
  // useEffect(() => {
  //   const timer = setInterval(() => setTime(new Date()), 1000);
  //   return () => clearInterval(timer);
  // }, []);

  async function updateImage() {
    // Create image reader and canvas context
    const imgReader = new FileReader();
    let rawImageData = null;
    const imgElt = document.getElementById("cam_canvas");
    const ctx = imgElt.getContext("2d");

    // Do this forever
    let img = new Image();

    // Reset variables

    let imageBlob = null;

    // Fetch image
    try {
      const fetchImageTimeout = 1000;
      const imageResponse = await timeout(fetchImageTimeout, fetch(imgUrl));

      imageBlob = await timeout(fetchImageTimeout, imageResponse.blob());

      // const imageResponse = await fetch(imgUrl, {
      //   signal: AbortSignal.timeout(2000),
      // });
      // imageBlob = await imageResponse.blob();

      // Store raw image data
      rawImageData = await imageBlob.arrayBuffer();
    } catch (error) {
      console.error("Error in fetching image: ", error);
      setTimeout(() => {
        updateImage();
      }, 10);
      return;
    }

    // Go to top of loop if we don't have image or bbox info
    if (!imageBlob) {
      console.error("Error fetching data");
      setTimeout(() => {
        updateImage();
      }, 10);
      return;
    }

    // Draw image
    imgReader.readAsDataURL(imageBlob);
    imgReader.onloadend = () => {
      img.onload = () => {
        // Get width and height of image
        const width = img.width;
        const height = img.height;
        //
        // // Clear canvas and set new size
        // ctx.clearRect(0, 0, imgElt.width, imgElt.height);
        imgElt.width = width;
        imgElt.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0);
      };
      img.src = imgReader.result;
    };
    setTimeout(() => {
      updateImage();
    }, 10);
  }

  useEffect(() => {
    updateImage();
  }, []);

  return (
    <canvas
      className="relative bg-gradient-to-br from-[#1f2229] to-[#2a2e35] rounded border-2 border-[var(--border)] overflow-hidden aspect-square flex-1 w-full shadow-lg"
      id="cam_canvas"
    ></canvas>
  );
}
