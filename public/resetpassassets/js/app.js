function myFunction(index) {
    if (index == 0) {
        var x = document.getElementById("newpassword");
    } else {
        var x = document.getElementById("confirmpassword");
    }
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}