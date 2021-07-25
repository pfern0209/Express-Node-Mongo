const express=require ('express');
const app=express();
const path=require('path');
const Campground=require('../models/campground')
const mongoose = require('mongoose')
const cities=require('./cities')
const {places,descriptors}=require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp', { useNewUrlParser: true, useUnifiedTopology: true ,useCreateIndex:true})

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",()=>{
  console.log("Database Connected")
})

const sample=array=>array[Math.floor(Math.random()*array.length)]

const seedDB=async()=>{
  await Campground.deleteMany({});
  for(let i=0;i<150;i++){
    let random1000=Math.floor(Math.random()*1000);
    const price=Math.floor((Math.random()*20)+10);
    const camp=new Campground ({
      author:'60f8d5c90a73238f2087affd',
      location:`${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
      price,
      geometry: { "type" : "Point", "coordinates" : [cities[random1000].longitude,cities[random1000].latitude] },
      images: [
    {
      url: 'https://res.cloudinary.com/dwvdq6l5m/image/upload/v1627035824/YelpCamp/movrwsjd0sgykx7ntc3d.jpg',
      filename: 'YelpCamp/movrwsjd0sgykx7ntc3d'
    },
    {
      url: 'https://res.cloudinary.com/dwvdq6l5m/image/upload/v1627035831/YelpCamp/n1f9jsgnsegvyohraxoa.jpg',
      filename: 'YelpCamp/n1f9jsgnsegvyohraxoa'
    },
  ]
    })
    await camp.save();
  }
}

seedDB().then(()=>{
  mongoose.connection.close();
});