var obj = {
  name: "Hell Welcome",
  gender: "Male",
  address: "",
  status: "",
};

var per = 0;

const initate = (p) => {
  if (p?.name) {
    per += per / 4;
  }
  if (p?.gender) {
    per += per / 4;
  }
  if (p?.address) {
    per += per / 4;
  }
  if (p?.status) {
    per += per / 4;
  }
};
console.log(initate(obj));
