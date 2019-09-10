function copyval(el) {
    var out = document.getElementsByClassName(el.id);
    for (j=0; j < out.length; j++) {
        out[j].textContent = el.value;
    }
}

function copyval_replace(el, original, replacement) {
    var out = document.getElementsByClassName(el.id);
    for (j=0; j < out.length; j++) {
        out[j].textContent = el.value.replace(original, replacement);
    }
}