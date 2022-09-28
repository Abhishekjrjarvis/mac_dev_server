const megreElement = (arr, left, middle, right) => {
  let n1 = middle - left + 1;
  let n2 = right - middle;
  const leftTemp = new Array(n1);
  const rightTemp = new Array(n2);
  //   console.log(arr[0]);

  for (let i = 0; i < n1; i++) leftTemp[i] = arr[left + i];
  for (let j = 0; j < n2; j++) rightTemp[j] = arr[middle + 1 + j];

  // Merge the temp arrays back into sort format

  // Initial index of first subarray
  let i = 0;

  // Initial index of second subarray
  let j = 0;

  // Initial index of merged subarray
  let k = left;

  while (i < n1 && j < n2) {
    if (new Date(leftTemp[i].createdAt) >= new Date(rightTemp[j].createdAt)) {
      arr[k] = leftTemp[i];
      i++;
    } else {
      arr[k] = rightTemp[j];
      j++;
    }
    k++;
  }

  // Copy the remaining elements of
  // L[], if there are any
  while (i < n1) {
    arr[k] = leftTemp[i];
    i++;
    k++;
  }

  // Copy the remaining elements of
  // R[], if there are any
  while (j < n2) {
    arr[k] = rightTemp[j];
    j++;
    k++;
  }

  return arr;
};

const divideElement = (arr, left, right) => {
  if (left >= right) return;
  let middle = left + parseInt((right - left) / 2);
  divideElement(arr, left, middle);
  divideElement(arr, middle + 1, right);
  return megreElement(arr, left, middle, right);
};

exports.customMergeSort = (arr) => {
  const arr_size = arr?.length;
  return divideElement(arr, 0, arr_size - 1);
};
