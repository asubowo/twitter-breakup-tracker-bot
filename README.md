# Track breakups in live time in Twitter! #
This was a project I've been working on in my spare time when I had a drink one too many on a cynical Friday evening. However it ended up me expanding the project into fleshing out my journey in learning NodeJS, Postgres, Chartjs, and more.

Most of my prior experience was deploying Node apps into a Heroku instance, but I wanted to challenge myself and build out more or less a full stack in my personal development lab at home. I suppose this is my big ol' brainchild of it.

# Example dataset #
If done properly, you should see a dataset like the following image below. Take note that on 7/15 and 7/16, Twitter API was severely rate limited due to a major security breach over at Twitter HQ

![datamining breakups](http://andrewsubowo.com/wp-content/uploads/2020/07/breakupchart.png)

# Infrastructure #
## dotenv ##
This project utilizes dotenv to store environment variables at runtime. 

## Chartjs ##
Never used chartjs before, or by any regards .ejs files. I'm used to Ansible and Jinja templating, so this was pretty straight forward. It's actually really nice being able to just send variables across files as .ejs lets me.

## Twitter's API ##
Twitter's API is actually pretty straight forward to consume and fun to datamine. Honestly, go out there and request a development key of your own!

## Postgres ##
I'm definitely not going to explain how to install Postgres in this small README. I will say, that all I did was initialize a new TABLE that has one column of type: TIMESTAMP. All this bot really is doing is that for every detected tweet that matches the filter, just log the timestamp into Postgres. From there we just do some fancy sorting.
