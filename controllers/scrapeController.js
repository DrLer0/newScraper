var express = require("express");
var axios = require("axios");
var cheerio = require("cheerio");

var router = express.Router();

var db = require("../models");

router.get("/", function(req, res) {
  db.Article.find({ "saved": false }, null, { lean: true })
    .then(function(dbArticle) {
      var hbsObject = {
        article: dbArticle
      };
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      res.json(err);
    });
});

router.get("/saved", function(req, res) {
  db.Article.find({ "saved": true }, null, { lean: true })
    .then(function(dbArticle) {
      var hbsObject = {
        article: dbArticle
      };
      res.render("savedArticles", hbsObject);
    })
    .catch(function(err) {
      res.json(err);
    });
})

router.get("/clear", function(req, res) {
  mongooseconnection.connection.db.dropCollection("articles", function(
    err,
    result
  ) {
    console.log("Collection droped");
  });
})

// A GET route for scraping the echoJS website
router.get("/scrape", function(req, res) {
  const webURL = "https://www.cnn.com/us";
  // First, we grab the body of the html with axios
  axios.get(webURL).then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".cd__headline-text").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).text();
      let tempURL = $(this).parent("a").attr("href");
      result.link = "https://www.cnn.com" + tempURL;

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });
    res.redirect("/");
  });
});

// Route for getting all Articles from the db
router.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({}, null, { lean: true })
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...

  db.Article.findOne({ _id: req.params.id }, null, { lean: true })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      var hbsObject = {
        article: dbArticle
      };
      console.log("==========");
      console.log(hbsObject);
      console.log("==========");
      res.render("savedArticles", hbsObject);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

router.post("/article/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Article.findOneAndUpdate({ _id: req.params.id }, { "saved": true }, { new: true })
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/notes/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      console.log(dbArticle);
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Export routes for server.js to use.
module.exports = router;