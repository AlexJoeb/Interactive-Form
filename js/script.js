"use strict";

const form = $('form');

const submissionErrors = [];
const alertSection = $('.alert');
const alertList = $('.alert ul');

const nameRegex = new RegExp('^([a-z]+) ([a-z]+)$', 'i');
const emailRegex = new RegExp('[^@]+@[^\.]+\..+', 'i');
const creditCardRegex = new RegExp('^[0-9]{4} ?[0-9]{4} ?[0-9]{4} ?[0-9]{1,4}$');
const zipCodeRegex = new RegExp('^[0-9]{5}$');
const cvvRegex = new RegExp('^[0-9]{3}$');

const nameInput = $('#name');
const emailInput = $('#mail');
const jobRoleDropdown = $('#title');
const otherTitle = $('#other-title');

const design = $('#design');
const color = $('#color');

const actLabels = $(`.activities label`);
const actChecks = $(`input[type='checkbox']`);

const totalPriceSpan = $('#total');
let totalPrice = 0;

const creditCardInput = $('#cc-num');
const zipCode = $('#zip');
const cvv = $('#cvv');
const payment = $('#payment');
const creditCard = $('#credit-card');
const paypal = $('#paypal');
const bitcoin = $('#bitcoin');

const punsColors = [`<option value="gold">Gold (JS Puns shirt only)</option>`, 
                    `<option value="darkslategrey">Dark Slate Grey (JS Puns shirt only)</option>`, 
                    `<option value="cornflowerblue">Cornflower Blue (JS Puns shirt only)</option>`];
const iheartjsColors = [`<option value="steelblue">Steel Blue (I &#9829; JS shirt only)</option>`, 
                        `<option value="tomato">Tomato (I &#9829; JS shirt only)</option>`, 
                        `<option value="dimgrey">Dim Grey (I &#9829; JS shirt only)</option>`];

const workshops = [];
let numOfSelected = 0;

// When page content is loaded
$(document).on("DOMContentLoaded", () => {
  // Focus on name input
  nameInput.focus();
  
  // Initially hide fields
  otherTitle.hide();
  paypal.hide();
  bitcoin.hide();
  color.parent().hide();
  alertSection.hide();

  actLabels.each(e => {
    const text = actLabels[e].innerText.trim();
    if(!text.toLowerCase().includes("main conference")){
      const regexTime = ``;
      const regexDay = ``;

      const workshopName = text.match(/^(.*?)\s?Workshop?/)[0].replace(" Workshop", "");
      const workshopPrice = parseInt(text.match(/\$(\d+)/g)[0].replace('$', ''));
      const workshopTime = text.match(/(\d+)am|(\d+)pm/g);
      const workshopDay = text.match(/tuesday|wednesday/ig);
      // Turn time in the array into integers
      for(let i = 0; i < workshopTime.length; i++){
        workshopTime[i] = parseInt(workshopTime[i].replace(/am|pm/g, ""));
      }

      workshops.push(new Workshop(workshopName, workshopTime[0], workshopTime[1], workshopDay[0], workshopPrice, actLabels[e]));
    }else{
      workshops.push(new Workshop("Main Conference", 0,0,"Tuesday",200, actLabels[e]));
    }
  });
  
});

jobRoleDropdown.change((evt) => {
  // Check if 'other' was selected
  if (evt.target.value == "other") {
    // slide down other-title input field
    otherTitle.slideToggle();
  } else {
    // anything else selected, slide other-title input field up.
    otherTitle.slideUp();
  }
});

design.change((e) => {
  // Value of design dropdown when its changed by user.
  const theme = e.target.value;
  color.parent().show();
  console.log(theme);
  if(theme == "js puns"){
    // Only add "js puns" colors to selection
    color.empty();
    for(let c in punsColors){
      const option = $(`${punsColors[c]}`);
      color.append(option);
    }
  }else if(theme == "heart js"){
    // Only add "heart js" colors to selection
    color.empty();
    for(let c in iheartjsColors){
      const option = $(`${iheartjsColors[c]}`);
      color.append(option);
    }
  }else if(theme == "Select Theme"){
    color.parent().hide();
  }else{
    // Put all colors back in if they go to invalid color or back to 'Select Theme'
    color.empty();
    for(let c in iheartjsColors){
      const option = $(`${iheartjsColors[c]}`);
      color.append(option);
    }
    for(let c in punsColors){
      const option = $(`${punsColors[c]}`);
      color.append(option);
    }
  }
});

actChecks.click((e) => {
  const name = getCheckboxName(e.target.name);
  const workshop = getWorkshopByName(name);
  if(e.target.checked){
    getConflictingWorkshops(workshop).forEach(w => {
      $($(w.element).children()[0]).attr('disabled', true);
      $(w.element).css('color', 'gray');
    });
    updatePrice(workshop._price);
    numOfSelected++;
  }else{
    getConflictingWorkshops(workshop).forEach(w => {
      $($(w.element).children()[0]).attr('disabled', false);
      $(w.element).css('color', 'black');
    });
    updatePrice(-workshop._price);
    numOfSelected--;
  }
  
});

payment.change((e) => {
  const val = e.target.value;

  if(val == "credit card"){
    creditCard.show();
    paypal.hide();
    bitcoin.hide();
  }else if(val == 'paypal'){
    paypal.show();
    creditCard.hide();
    bitcoin.hide();
  }else if(val == 'bitcoin'){
    bitcoin.show();
    creditCard.hide();
    paypal.hide();
  }else{
    creditCard.show();
    paypal.hide();
    bitcoin.hide();
  }
});

form.submit((e) => {
  nameInput.css('border-color', '#c1deeb');
  emailInput.css('border-color', '#c1deeb');
  creditCardInput.css('border-color', '#c1deeb');
  zipCode.css('border-color', '#c1deeb');
  cvv.css('border-color', '#c1deeb');

  submissionErrors.length = 0;
  alertList.empty();

  if(!nameRegex.test(nameInput.val())){
    error(`Your name is in an invalid format. Please use "First Last".`);
    nameInput.css('border-color', '#f31431');
  }
  
  if(!emailRegex.test(emailInput.val())){
    error(`Your e-mail is in an invalid format.`);
    emailInput.css('border-color', '#f31431');
  }
  
  if(payment.val() == 'credit card'){
    if(!creditCardRegex.test(creditCardInput.val())){
      error(`Your payment card number must be 13-16 digits long.`);
      creditCardInput.css('border-color', '#f31431');
    }
    
    if(!zipCodeRegex.test(zipCode.val())){
      error(`Your zip code must be 5 digits long.`);
      zipCode.css('border-color', '#f31431');
    }

    if(!cvvRegex.test(cvv.val())){
      error(`Your CVV must be 3 digits long.`);
      cvv.css('border-color', '#f31431');
    }
  }

  if(numOfSelected <= 0){
    error('You must select at least one activity to register for.');
  }

  if(submissionErrors.length > 0){
    e.preventDefault();
    for(let x in submissionErrors){
      var msg = submissionErrors[x];
      var li = $(`<li>${msg}</li>`);
      alertList.append(li);
    }
    alertSection.show();
    return;
  }

});

const error = err => {
  submissionErrors.push(err);
}

const updatePrice = (price) => {
  totalPrice += price;
  totalPriceSpan.text(totalPrice);
}

const getWorkshopByName = n => {
  for(let w in workshops){
    if(workshops[w].name.toLowerCase().includes(n.toLowerCase().trim())){
      return workshops[w];
    }
  }

  return null;
}

const getWorkshopsByDay = d => {
  const arr = [];
  for(let w in workshops){
    if(workshops[w].day.toLowerCase().trim() == d.toLowerCase().trim()){
      arr.push(workshops[w]);
    }
  }

  return arr;
}

const workshopsConflict = (wOne, wTwo) => {
  return wOne.conflicts(wTwo._timeArray, wTwo.day);
}

const getConflictingWorkshops = w => {
  let array = [];

  array = workshops.filter(w2 => {
    return w != getWorkshopByName(w2.name) &&
           workshopsConflict(w, w2);
  });


  return array;
}

const getCheckboxName = name => {
 name = name.replace(/^js-|-/g, " ").trim();

 if(name == 'libs') return 'libraries';
 else if(name == 'all') return 'main conf';
 else return name;
}

const constantInputChecking = (input, regex) => {
  input.on('keyup', (e) => {
    var target = $(e.target);
    var text = target.val();

    if(!regex.test(text)){
      input.css('border-color', '#f31431');
    }else{
      input.css('border-color', '#c1deeb');
    }
  });
}

constantInputChecking(nameInput, nameRegex);
constantInputChecking(emailInput, emailRegex);
constantInputChecking(creditCardInput, creditCardRegex);
constantInputChecking(zipCode, zipCodeRegex);
constantInputChecking(cvv, cvvRegex);