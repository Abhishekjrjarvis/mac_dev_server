const { handle_undefined } = require("../Handler/customError");

exports.valid_initials = (real, imaginary) => {
  if (imaginary) {
    var valid_start = imaginary.startsWith(real);
    if (valid_start) {
      var frame_initials = imaginary?.slice(real?.length);
      var final = real + frame_initials;
      return final;
    } else {
      var new_real = handle_undefined(real);
      var combine_query = new_real + imaginary;
      if (combine_query.startsWith("Q")) {
        return combine_query;
      } else {
        return `Q${combine_query}`;
      }
    }
  }
};

exports.large_vote_candidate = (arr) => {
  let first_vote = -1,
    second_vote = -1;
  let winner = "";
  for (let i = 0; i <= arr.length - 1; i++) {
    if (arr[i].election_vote_receieved > first_vote) {
      second_vote = first_vote;
      first_vote = arr[i].election_vote_receieved;
      winner = arr[i].student;
    } else if (
      arr[i].election_vote_receieved > second_vote &&
      arr[i].election_vote_receieved != first_vote
    ) {
      second_vote = arr[i].election_vote_receieved;
    }
  }
  var data = {
    max_votes: first_vote - second_vote,
    winner: winner,
  };
  return data;
};
