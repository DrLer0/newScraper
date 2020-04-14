$(document).on("click", "#clearBtn", function() {
  $(".card-columns").empty();
  $(".card-deck").empty();
});

$(document).on("click", "#saveArticle", function() {
  // alert("save?");
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
      method: "POST",
      url: "/article/" + thisId
    })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      location.reload();
    });
});

$(document).on("click", ".seeNoteBtn", function() {
  var thisId = $(this).attr("data-id");
  var thisIdBtn = "#".concat($(this).attr("data-id"));

  $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
    // With that done, add the note information to the page
    .then(function(data) {
      $(thisIdBtn).modal('toggle');
    });
});

// When you click the savenote button
$(document).on("click", "#saveNote", function() {
  event.preventDefault();
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  var thisIdBtn = "#".concat($(this).attr("data-id"));

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
      method: "POST",
      url: "/notes/" + thisId,
      data: {
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
    // With that done
    .then(function(data) {
      // Log the response
      // console.log(data);
      $(thisIdBtn).modal('toggle');
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#bodyinput").val("");
});