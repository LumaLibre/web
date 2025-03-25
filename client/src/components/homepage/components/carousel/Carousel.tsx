import {useEffect, useState} from "react";
import styles from "./Carousel.module.scss";
import lumaFriends from "@/assets/lumas/LumaFriends.png";
import lumaArtmap from "@/assets/lumas/LumaArtmap.png";
import lumaFurniture from "@/assets/lumas/LumaFurniture.png";
import lumaBrewery from "@/assets/lumas/LumaBrewery.png";
import lumaFishing from "@/assets/lumas/LumaFishing.png";
import lumaHoarder from "@/assets/lumas/LumaHoarder.png";


const carouselBaggage = [
    {
        image: lumaFriends,
        alt: "Friend Luma Icon",
        description: "Make new friends, join friendly communities, and compete to be the largest, strongest town!"
    },
    {
        image: lumaArtmap,
        alt: "Luma Artmap",
        description: "Experiment with Artmap and create your own artworks to share with others!"
    },
    {
        image: lumaFishing,
        alt: "Luma Fishing",
        description: "Enjoy custom fishing with new fish rarities, collectors items, and a fishing journal to fill for rewards!"
    },
    {
        image: lumaFurniture,
        alt: "Luma Furniture",
        description: "Decorate your home with tons of unique furniture items and cosmetics!"
    },
    {
        image: lumaBrewery,
        alt: "Luma Brewery",
        description: "Collect different recipes to brew unique potions and special drinks! Dont forget to fill out your recipe book!"
    },
    {
        image: lumaHoarder,
        alt: "Luma Hoarder",
        description: "Sell items to the hoarder and compete with others for the top positions! Rewards are given out to top sellers!"
    }
];


function Carousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animClass, setAnimClass] = useState("");

    const currentItem = carouselBaggage[currentIndex];


    const handleArrow = (direction: string) => {
        const fadeClass = direction === "prev" ? styles.fadeRight : styles.fadeLeft;
        setAnimClass(fadeClass);

        setTimeout(() => {
            setCurrentIndex((prevIndex) => {
                if (direction === "prev") {
                    return prevIndex === 0 ? carouselBaggage.length - 1 : prevIndex - 1;
                } else {
                    return prevIndex === carouselBaggage.length - 1 ? 0 : prevIndex + 1;
                }
            });
        }, 500); // Anim delay
    };

    useEffect(() => {
        if (animClass) {
            setTimeout(() => {
                setAnimClass("");
            }, 50); // Small delay to allow DOM update
        }
    }, [currentIndex]); // Runs when `currentIndex` changes



    return (
        <div className={styles.carouselCard}>
            <div className={`${styles.carouselImageContainer} ${animClass}`}>
                <img src={currentItem.image} alt={currentItem.alt} className={styles.carouselImage} />
            </div>
            <div className={`${styles.carouselTextContainer} ${animClass}`}>
                <p>{currentItem.description}</p>
            </div>

            <a
                className={styles.leftCarouselArrow}
                onClick={() => handleArrow("prev")}
            />
            <a
                className={styles.rightCarouselArrow}
                onClick={() => handleArrow("next")}
            />
        </div>
    );
}

export default Carousel;
