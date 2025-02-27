// ------------ IMPORTS ------------ //
const express = require('express');
const router = express.Router();
const { MovieModel } = require('../models/MovieModel');
const listEndpoints = require("express-list-endpoints");
const asyncHandler = require('express-async-handler')
// import netflixData from "../data/netflix-titles.json"; // Dataset

// ------------ SEEDING DATABSE ------------ //
// This is here to make sure that the database is reset every time the server is restarted. I have commented it out because I don't want to reset the database every time I restart the server but I want to be able to use it if I need to.
// if (process.env.RESET_DB) {
// const seedDatabase = async () => {
//     await MovieModel.deleteMany({})

//     netflixData.forEach((netflixItem) => {
//         new MovieModel(netflixItem).save()
//     });
// }
// seedDatabase()
// }

// ------------ ERROR HANDLING ROUTE ------------ //
router.get("/", asyncHandler(async (req, res) => {
    try {
        const endpoints = listEndpoints(router);
        res.json(endpoints);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
}));

// ------------ OTHER ROUTES ------------ //
// Gets all the movies from the dataset
router.get("/movies", (req, res) => {
    MovieModel.find()
        .then(movies => {
            if (movies.length > 0) {
                res.json(movies);
            } else {
                res.status(404).json({ error: "No movies found" });
            }
        })
        .catch(error => {
            res.status(500).json({ error: "Something went wrong, please try again." });
        });
});

// Gets an individual movie based on its id. 
router.get("/movies/:id", (req, res) => {
    const movieID = req.params.id; // Gets the id from the params
    MovieModel.findOne({ _id: movieID }).then(movie => { // Checks if the id from the param is the same as the show_id, if it then it's displayed in json. Findone, because I only want one result.
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json({ error: `Movie with id ${movieID} not found. Having troubles finding the movie? Make sure you switch out ':id' for the id you wish to base your query on` });
        }
    })
        .catch(error => {
            res.status(500).json({ error: "Something went wrong, please try again. If your having problems with the query, check the readme for further instructions." });
        });
});

// Gets all movies with the release year searched for in the querystring. 
router.get("/movies/year/:year", (req, res) => {
    const releaseYear = parseInt(req.params.year); // Gets the id from the params

    // An extra error message to provide a better user experience.
    if (isNaN(releaseYear)) {
        res.status(400).json({ error: "Please enter a valid year, in place of the \":year\"-placeholder, in the URL field" });
        return;
    }

    MovieModel.find({ release_year: releaseYear })
        .then(year => { // Checks if the release_year from the param is the same as the release_year, if it is, then it's displayed in json.
            if (year.length > 0) { // Checks if a movie was found
                res.json(year);
            } else {
                res.status(404).json({ error: `Movie with the release date ${releaseYear} wasn't found` });
            }
        })
        .catch(error => {
            res.status(500).json({ error: "Something went wrong, please try again. If your having problems with the query, check the readme for further instructions." });
        });
});

// Makes it possible to query on a string included in the title
router.get("/movies/title/:title", (req, res) => {
    const titleQuery = req.params.title.toLowerCase();
    MovieModel.find({ title: { $regex: titleQuery, $options: "i" } }) // Query-filter. Search is performed on "title", titleQuery is the regex pattern searched for, options: "i" makes the search case-insensitive
        .then(movies => {
            if (movies.length > 0) {
                res.json(movies);
            } else {
                res.status(404).json({ error: `No movies found with the word '${titleQuery}' in the title` });
            }
        })
        .catch(error => {
            res.status(500).json({ error: "Something went wrong, please try again. If your having problems with the query, check the readme for further instructions." });
        });
});

module.exports = router;