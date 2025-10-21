import React, { useState, useEffect } from 'react';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import ChevronRightIcon from '../components/icons/ChevronRightIcon';

const ImageSlider = ({ slides = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // If no slides provided, return null or a placeholder
    if (!slides || slides.length === 0) {
        return (
            <div className="h-64 md:h-96 w-full mx-auto relative mb-8 rounded-xl overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500 text-lg">No slides available</p>
            </div>
        );
    }

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    };

    // Auto-advance slides
    useEffect(() => {
        if (isPaused || slides.length <= 1) return;

        const timer = setTimeout(goToNext, 5000);
        return () => clearTimeout(timer);
    }, [currentIndex, isPaused]);

    // Pause on hover
    const handleMouseEnter = () => {
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') {
            goToPrevious();
        } else if (e.key === 'ArrowRight') {
            goToNext();
        } else if (e.key >= '1' && e.key <= '9') {
            const slideIndex = parseInt(e.key) - 1;
            if (slideIndex < slides.length) {
                goToSlide(slideIndex);
            }
        }
    };

    const currentSlide = slides[currentIndex];

    return (
        <div 
            className="h-64 md:h-96 w-full mx-auto relative group mb-8 rounded-xl overflow-hidden shadow-lg focus:outline-none"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Image carousel"
        >
            {/* Slide Image */}
            <div 
                className="w-full h-full bg-center bg-cover duration-500 ease-in-out transition-all"
                style={{ backgroundImage: `url(${currentSlide.url})` }}
                aria-label={`Slide ${currentIndex + 1} of ${slides.length}: ${currentSlide.title}`}
            >
                {/* Overlay with Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex flex-col justify-end items-start text-white p-6 md:p-8">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl md:text-4xl font-bold mb-2 animate-fade-in-down">
                            {currentSlide.title}
                        </h2>
                        <p className="text-base md:text-lg animate-fade-in-up opacity-90">
                            {currentSlide.subtitle}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {/* Left Arrow */}
            <button
                onClick={goToPrevious}
                className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 left-4 text-2xl rounded-full p-3 bg-black/40 text-white cursor-pointer hover:bg-black/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 items-center justify-center"
                aria-label="Previous slide"
            >
                <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Right Arrow */}
            <button
                onClick={goToNext}
                className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 right-4 text-2xl rounded-full p-3 bg-black/40 text-white cursor-pointer hover:bg-black/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 items-center justify-center"
                aria-label="Next slide"
            >
                <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {slides.map((_, slideIndex) => (
                    <button
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white ${
                            currentIndex === slideIndex 
                                ? 'bg-white scale-110' 
                                : 'bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Go to slide ${slideIndex + 1}`}
                        aria-current={currentIndex === slideIndex ? 'true' : 'false'}
                    />
                ))}
            </div>

            {/* Slide Counter */}
            <div className="absolute top-4 right-4 bg-black/40 text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentIndex + 1} / {slides.length}
            </div>

            {/* Pause Indicator */}
            {isPaused && (
                <div className="absolute top-4 left-4 bg-black/40 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Paused
                </div>
            )}

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
                <div 
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{ 
                        width: isPaused ? '0%' : `${((currentIndex + 1) / slides.length) * 100}%` 
                    }}
                />
            </div>
        </div>
    );
};

export default ImageSlider;