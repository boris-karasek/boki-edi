import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Product({ name, src}) {
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const [fullscreenName, setFullscreenName] = useState(null);

    function openFullscreen(image, text) {
        setFullscreenImage(image);
        setFullscreenName(text);
        window.history.pushState({ fullscreen: true }, ""); // Add a history state
    }

    function closeFullscreen() {
        setFullscreenImage(null);
        setFullscreenName(null);
        if (window.history.state?.fullscreen) {
            window.history.back(); // Navigate back in history
        }
    }

    useEffect(() => {
        const handlePopState = () => {
            // Close fullscreen if history state indicates fullscreen
            if (fullscreenImage) {
                closeFullscreen();
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [fullscreenImage]);

    return (
        <div className="group relative border-2 border-stone-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all ease-in-out duration-300">
            {/* Product Image */}
            <div
                className="relative w-full h-52 cursor-pointer flex justify-center items-center group-hover:scale-105 group-hover:shadow-xl transition-all ease-in-out duration-300"
                onClick={() => openFullscreen(src, name)}
            >
                <img
                    className="w-full h-full object-cover rounded-lg transform group-hover:scale-105 transition-all duration-300"
                    src={src}
                    alt={name}
                />
            </div>

            {/* Product Name */}
            <div className="absolute bottom-0 left-0 right-0 p-1 bg-black bg-opacity-80 text-white text-center text-base font-medium rounded-b-lg">
                {name}
            </div>

            {/* Fullscreen Modal */}
            {fullscreenImage &&
                createPortal(
                    <div
                        className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
                        onClick={closeFullscreen}
                    >
                        <div className="relative w-full max-w-5xl max-h-[90%] flex justify-center items-center">
                            {/* Set max-width and max-height for different screen sizes */}
                            <img
                                className="max-w-[90%] max-h-[80%] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[50%] xl:max-w-[60%] object-contain rounded-lg"
                                src={fullscreenImage}
                                alt={fullscreenName}
                            />
                            <p className="absolute bottom-10 text-center text-white text-xl sm:text-2xl font-semibold bg-black bg-opacity-50 p-2 rounded-lg">
                                {fullscreenName}
                            </p>
                        </div>
                    </div>,
                    document.getElementById('modal')
                )}
        </div>
    );
}