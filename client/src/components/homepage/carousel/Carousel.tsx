import {useEffect, useRef, useState} from "react";
import styles from "./Carousel.module.scss";

import lumaFriends from "@/assets/lumas/LumaFriends.png";
import lumaArtMap from "@/assets/lumas/LumaArtmap.png";
import lumaFurniture from "@/assets/lumas/LumaFurniture.png";
import lumaBrewery from "@/assets/lumas/LumaBrewery.png";
import lumaFishing from "@/assets/lumas/LumaFishing.png";
import lumaHoarder from "@/assets/lumas/LumaHoarder.png";

const carouselBaggage = [
    {
        image: lumaFriends,
        alt: "Friend Luma Icon",
        description: "Make new friends, join towns, and create your own community with others!",
    },
    {
        image: lumaArtMap,
        alt: "Luma ArtMap",
        description: "Experiment with ArtMap and create your own artworks to share with others!",
    },
    {
        image: lumaFishing,
        alt: "Luma Fishing",
        description: "Enjoy custom fishing with rarities, collector items, and a fishing journal to fill for rewards!",
    },
    {
        image: lumaFurniture,
        alt: "Luma Furniture",
        description: "Decorate your home with tons of unique furniture items and cosmetics!",
    },
    {
        image: lumaBrewery,
        alt: "Luma Brewery",
        description: "Collect unique recipes to brew unique potions and special drinks! Don't forget to fill out your recipe book!",
    },
    {
        image: lumaHoarder,
        alt: "Luma Hoarder",
        description: "Sell items to the Hoarder and compete with others for the top positions!",
    },
];


// I wish we had used Astro
function preloadImages() {
    carouselBaggage.forEach((item) => {
        const img = new Image();
        img.src = item.image;
    });
}



function Carousel() {
    // On mount stuff
    useEffect(() => {
        preloadImages();
        startAutoSwipe();
        return stopAutoSwipe;
    }, []);


    const [currentIndex, setCurrentIndex] = useState(Math.floor(Math.random() * carouselBaggage.length));
    const [animClass, setAnimClass] = useState("");
    const currentItem = carouselBaggage[currentIndex];

    // Ref to track interaction timeout
    const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const autoSwipeIntervalRef = useRef<NodeJS.Timeout | null>(null);


    // Function to start auto-swiping
    const startAutoSwipe = () => {
        stopAutoSwipe(); // Ensure no duplicate intervals
        autoSwipeIntervalRef.current = setInterval(() => {
            swipe(true);
        }, 500);
    };

    // Function to stop auto-swiping
    const stopAutoSwipe = () => {
        if (autoSwipeIntervalRef.current) {
            clearInterval(autoSwipeIntervalRef.current);
            autoSwipeIntervalRef.current = null;
        }
    };

    // Reset auto-swiping with 15s delay after interaction
    const resetAutoSwipe = () => {
        stopAutoSwipe(); // Stop auto-swiping immediately

        if (interactionTimeoutRef.current) {
            clearTimeout(interactionTimeoutRef.current);
        }

        interactionTimeoutRef.current = setTimeout(() => {
            startAutoSwipe();
        }, 12000);
    };

    const swipe = (forward: boolean) => {
        const fadeClass = !forward ? styles.fadeRight : styles.fadeLeft;
        setAnimClass(fadeClass);

        setTimeout(() => {
            setCurrentIndex((prevIndex) => {
                if (!forward) {
                    return prevIndex === 0 ? carouselBaggage.length - 1 : prevIndex - 1;
                } else {
                    return prevIndex === carouselBaggage.length - 1 ? 0 : prevIndex + 1;
                }
            });
        }, 550); // Anim delay

        resetAutoSwipe();
    };

    useEffect(() => {
        if (animClass) {
            setTimeout(() => {
                setAnimClass(styles.fadeIn);
            }, 80); // Small delay to allow DOM update
        }
    }, [currentIndex]); // Runs when `currentIndex` changes

    return (
        <div className={styles.carouselCard}>
            <div className={`${styles.carouselImageContainer} ${animClass}`}>
                <img
                    src={currentItem.image}
                    alt={currentItem.alt}
                    className={styles.carouselImage}
                />
            </div>
            <div className={`${styles.carouselTextContainer} ${animClass}`}>
                <p>{currentItem.description}</p>
            </div>

            <a
                className={styles.leftCarouselArrow}
                onClick={() => swipe(false)}
            />
            <a
                className={styles.rightCarouselArrow}
                onClick={() => swipe(true)}
            />
        </div>
    );
}

export default Carousel;
