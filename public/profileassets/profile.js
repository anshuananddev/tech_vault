const btn=document.querySelector('.show');
const bt=document.querySelector('.hide');
function handleClick() {
    console.log(document.getElementsByClassName('show')[0].checked);
    if(document.getElementsByClassName('show')[0].checked)
    {
    document.getElementsByClassName("prof")[0].style.display ="block";
    //show textbox
    }
    else
    {
        document.getElementsByClassName("prof")[0].style.display ='none';
    //hide textbox.
    }
    }
btn.addEventListener('click',handleClick);
bt.addEventListener('click',handleClick);

console.log(document.getElementsByClassName('show')[0].checked);
