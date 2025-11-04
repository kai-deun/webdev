# VitalSoft Prescription Tracking System

## Please add information about the webapp

## Note: How to use, Branch testfunction

- load `maindb.sql` from the database directory by using Workbench
    - Open Workbench, go the File tab, Open SQL Script
    - After that, execute the script by using the thunder icon
    - Refresh the Schemas using the refresh button on the right side of the Schemas Tab
- put the project inside the www of wamp64
- configure the httpd-vhost.conf
<VirtualHost *:80>
  ServerName doctorprescripttest.com
  DocumentRoot "C:/wamp64/www/webdev"
  <Directory "C:/wamp64/www/webdev">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>
</VirtualHost>
- add the website/domain name to the hosts file (127.0.0.1 doctorprescripttest.com)
- restart services wampserver

- open the site (doctorprescripttest.com) and navigate to the Doctor.html
- Do not directly open in Live Server of vscode!