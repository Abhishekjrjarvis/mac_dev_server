exports.shuffleArray = (merge_array) => {
  let len = merge_array.length,
    item_shuffle;
  for (item_shuffle = len - 1; item_shuffle > 0; item_shuffle--) {
    let rand_shuffle_item = Math.floor(Math.random() * (item_shuffle + 1));
    var temp = merge_array[item_shuffle];
    merge_array[item_shuffle] = merge_array[rand_shuffle_item];
    merge_array[rand_shuffle_item] = temp;
  }
  return merge_array;
};
