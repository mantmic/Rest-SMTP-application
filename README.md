# README #

### What is this repository for? ###

This application was designed to create a simple interface that allows users to send emails with attachments. As the intent was for distributed reported purposes the application currently supports csv and png attachments.

#### Features ####

HTML reports with;
+ HTML formatted text
+ CSV attachments via JSON get request
+ PNG attachments
+ Embedded PNG images

As there are currently no authentication methods it is strongly advised this application is kept in a secure domain only accessible by the backend processes which trigger emails.

#### Future enhancements ####

-Incorporate authentication method
-Enable HTML tables via JSON get request
-SSL


#### API Documentation ####
To view definitions of the end points deploy the application and visit the root endpoint.

### How do I get set up? ###
Build a docker image from this repository and run the image in a container mapping port 8889.

#### Example
Build image named 'rest_email_reports' and run on port 20.

##### Build #####
docker build -t rest_email_reports rest_email_reports

##### Run #####
docker run -d --restart always -p 20:8889 rest_email_reports

Documentation can be found at
http://localhost:20/
