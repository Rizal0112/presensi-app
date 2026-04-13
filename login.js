// USER TERDAFTAR (bisa kamu ganti)
const users = [
    { email: "asisten@gmail.com", password: "Fisdas" },
    { email: "praktikan@gmail.com", password: "Fisika" }
];

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("userEmail", email);

        window.location.href = "index.html";
    } else {
        alert("Email atau password salah!");
    }
});