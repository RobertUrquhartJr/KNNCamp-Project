const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campgrounds');

mongoose.connect('mongodb://127.0.0.1:27017/knn-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 500; i++) {
        const random1k = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 40) + 10;
        const camp = new Campground({
            author: '6692ce357da5b2da56b6d69d',
            location: `${cities[random1k].city},${cities[random1k].state} `,
            title: `${sample(descriptors)} ${sample(places)} `,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1k].longitude,
                    cities[random1k].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dkpfhejra/image/upload/v1720985482/KNNCamp/qqoalzz9zxitzt7ly3tn.png',
                    filename: 'KNNCamp/qqoalzz9zxitzt7ly3tn'
                },
                {
                    url: 'https://res.cloudinary.com/dkpfhejra/image/upload/v1720985483/KNNCamp/lnk44xftgde2ikdw43tk.png',
                    filename: 'KNNCamp/lnk44xftgde2ikdw43tk'
                },
                {
                    url: 'https://res.cloudinary.com/dkpfhejra/image/upload/v1720985483/KNNCamp/zodjlwajfrctgrlbx3ax.jpg',
                    filename: 'KNNCamp/zodjlwajfrctgrlbx3ax'
                },
                {
                    url: 'https://res.cloudinary.com/dkpfhejra/image/upload/v1720985484/KNNCamp/v8klqdcuqwiirvibfkss.png',
                    filename: 'KNNCamp/v8klqdcuqwiirvibfkss'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi fuga deserunt consequatur maxime at similique adipisci repudiandae vero dolores quae, culpa libero aspernatur earum eos aliquam quidem aut! Ullam, voluptatibus. Lorem ipsum dolor sit amet consectetur adipisicing elit.Quasi fuga deserunt consequatur maxime at similique adipisci repudiandae vero dolores quae, culpa libero aspernatur earum eos aliquam quidem aut! Ullam, voluptatibus. Lorem ipsum dolor sit amet consectetur adipisicing elit.Quasi fuga deserunt consequatur maxime at similique adipisci repudiandae vero dolores quae, culpa libero aspernatur earum eos aliquam quidem aut! Ullam, voluptatibus.',
            price
        })
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
})