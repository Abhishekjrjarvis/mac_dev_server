module.exports.universal_random_password_student_code = () => {
    const upperCase = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const lowerCase = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "t", "u", "v", "w", "x", "y", "z"]
    const u_1 = Math.floor(Math.random() * 10);
    const u_2 = Math.floor(Math.random() * 10);
    const u_3 = Math.floor(Math.random() * 10);
    const u_4 = Math.floor(Math.random() * 10);
    const u_5 = Math.floor(Math.random() * 26);
    const u_6 = Math.floor(Math.random() * 26);
    const u_7 = Math.floor(Math.random() * 26);
    const u_8 = Math.floor(Math.random() * 26);
    const u_9 = Math.floor(Math.random() * 26);
    const u_10 = Math.floor(Math.random() * 26);
    const userExp = `QPay-${upperCase[u_5]}${upperCase[u_6]}${digits[u_3]}${lowerCase[u_9]}${digits[u_4]}${digits[u_1]}${lowerCase[u_10]}${digits[u_2]}${upperCase[u_7]}${upperCase[u_8]}`;
    return userExp;
  };