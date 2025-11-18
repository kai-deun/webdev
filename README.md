# WINDOW SETUP

- Run `prescription_db.sql` from the database directory (just run the script, schema is automatic)

- Configure the WampServer `httpd-vhosts.conf` by using the following code:
```
<VirtualHost *:80>
  ServerName vitalsoft-prescription.com
  DocumentRoot "C:/wamp64/www/proj_name/doctor_module/index.php"
  <Directory "C:/wamp64/www/proj_name/doctor_module/index.php">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
  </Directory>
</VirtualHost>
```
By following the conventional path directory, Apache itself will automatically look for the index.php

- Restart all services or try to start from zero the WampServer

- Don't forget to add the server ip + the domain name in the `hosts` of the client for access

---