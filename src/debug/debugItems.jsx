import d1   from "./d1.png";
import d2   from "./d2.png";
import d3   from "./d3.png";
import d4   from "./d4.png";
import d5   from "./d5.png";
import d6   from "./d6.png";
import d7   from "./d7.png";
import d8   from "./d8.png";
import d9   from "./d9.png";
import d10  from "./d10.png";
import d11  from "./d11.png";
import d12  from "./d12.png";
import d13  from "./d13.png";
import d14  from "./d14.png";
import d15  from "./d15.png";

const images = [
    d1,
    d2,
    d3,
    d4,
    d5,
    d6,
    d7,
    d8,
    d9,
    d10,
    d11,
    d12,
    d13,
    d14,
    d15,
];

const titles = {
    0: "Latvian Sight.png",
    1: "Stupid.png",
    2: "Smiley.png",
    3: "Heart Attack.png",
    4: "Heart give.png",
    5: "Hopium.png",
    6: "Stoic.png",
    7: "Panix.png",
    8: "The voices.png",
    9: "B-b-b-b-b-but.png",
    10: "Scarecrow.png",
    11: "Bowling.oink",
    12: "Shiny yet deadly coins.png",
    13: "Angry.png",
    14: "Why the long face?.png",
};

export const GetItem = (index) => {
    return {
        id: index,
        img: images[index],
        title: titles[index],
    };
};

export const GetItems = (length) => {
    let list = [];
    for (let i = 0; i < length; i++) {
        const randVal = Math.round(Math.random() * (images.length - 1));

        list.push(GetItem(randVal));
    }

    return list;
}