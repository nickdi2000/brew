# BrewTokens -- Brewery Rewards Program #

A reward program for breweries to use with their customers.  The customers can earn points by buying beer among other special events and methods that the brewery management can decide on. 

The app can be customized to include branding of their brewery

The QR code system makes it easy to 'authorize' points.  The brewery simply needs to have one (or several QR codes for different denominations or prizes) -- when the user scans it, they automatically get that value added to their account.  1-per-day is fixed right into the method to avoid accidental multiple transactions or abuse. 

Perks for brewery
- get valueable info and insights into the customer behaviors (such as what beers they like, when they come, from where, etc)
- encourage return customers (prizes can be delayed by a week for example)
- inherantly spreads the brewery in general via word of mouth


Partnership with TriviaRat
if you already have a triviarat account, BrewTokens is free to use!
image: fe/src/images/triviarat-logo.png


POSTMARK SAMPLE:
npm install postmark --save

// Require:
var postmark = require("postmark");

// Send an email:
var client = new postmark.ServerClient("cfcf1784-ebb9-43b1-abd1-dcc823c803e6");

client.sendEmailWithTemplate({
  "From": "contact@brewtokens.com",
  "To": "client@gmail.com",
  "TemplateAlias": "welcome-magic",
  "TemplateModel": {
    "product_url": "product_url_Value",
    "product_name": "product_name_Value",
    "name": "name_Value",
    "magic_login_url": "magic_login_url_Value",
    "support_email": "support_email_Value",
    "help_url": "help_url_Value",
    "live_chat_url": "live_chat_url_Value",
    "sender_name": "sender_name_Value",
    "company_name": "company_name_Value",
    "company_address": "company_address_Value",
    "action_url": "action_url_Value",
    "login_url": "login_url_Value",
    "username": "username_Value",
    "trial_length": "trial_length_Value",
    "trial_start_date": "trial_start_date_Value",
    "trial_end_date": "trial_end_date_Value"
  }
});
