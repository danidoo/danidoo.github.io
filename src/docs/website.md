## Creando un Website cifrado con TLS usando llaves del CloudHSM

### 1. Cree un usuario para el servidor web y comparta llave privada
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __1.1.__ Abra en una nueva pestaña o ventana del navegador del [AWS CloudWatch](https://console.aws.amazon.com/cloudwatch/home) en la terminal de la instancia
- __1.2.__ Seleccione el **Logs** en el menu lateral
- __1.3.__ Haga click en el "Log Group" con el nombre **/aws/cloudhsm/cluster-&lt;cluster_id&gt;** y después en **Search Log Group**
- __1.4.__ Filtre los logs por el evento de generación de par de llaves **CN_GENERATE_KEY_PAIR**
- __1.5.__ Haga click en la flecha para expandir los logs

Entre el **Key Handle** de la llave publica generado con openssl: <input type="text" id="openssl-priv-key-handle" onkeyup="copyval(this);"/><br>
<br>

- __1.6.__ Vuelva a la pestaña o ventana del navegador del [AWS Systems Manager](https://console.aws.amazon.com/systems-manager/home) en la terminal de la instancia
- __1.7.__ Entre en el agente de administración del cluster con el comando:

    ./cloudhsm_mgmt_util.sh

- __1.8.__ Login

    loginHSM CO admin defaultPassword

- __1.9.__ Cree un nuevo usuario para el servidor web

    createUser CU webserver1 defaultPassword

- __1.10.__ 

    logoutHSM

- __1.11.__ Login

    loginHSM CU user1 defaultPassword

- __1.12.__ 

    listUsers

Entre el **User ID** del usuario **webserver1**: <input type="text" id="webserver1-user-id" onkeyup="copyval(this);"/><br>
<br>

- __1.13.__ Comparta la llave privada con el usuario webserver1 con el comando:

    shareKey <span class="openssl-priv-key-handle">&lt;public key handle&gt;</span> <span class="webserver1-user-id">&lt;webserver1 user id&gt;</span>  1
</details>

### 2. Cree un servidor web usando la llave en el CloudHSM
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __2.1.__ Vuelva a pestaña o ventana del navegador del [AWS EC2](https://console.aws.amazon.com/ec2/home)
- __2.2.__ Haga click en **Launch Instance**
- __2.3.__ Seleccione la AMI **Amazon Linux 2 AMI** haciendo click en **Select** en la linea que corresponde
- __2.4.__ Deje seleccionado el tipo de instancia t2.micro y haga click en **Next: Configure Instance Details**
- __2.5.__ En la opción **Network** elija la VPC con nombre **cloudhsm-vpc**
- __2.6.__ En la opción **Subnet** elija la Subnet con nombre **public-subnet-us-east-1a**
- __2.7.__ En IAM role seleccione el perfil **EC2-SSM+S3Crypto** y haga click en **Next: Add Storage**
- __2.8.__ Haga click en **Next: Add Tags**
- __2.9.__ Haga click en **Add Tag**, en el campo "Key" llene con **Name** y en el campo "Value" llene con **webserver1**
- __2.10.__ Haga click en **Next: Configure Security Group**
- __2.11.__ Deje **Create a new security group** seleccionado y en "Security group name" llene con **webserver1-sg**
- __2.12.__ Borre la linea de configuración de acceso SSH haciendo click en el icono **X**
- __2.13.__ Haga click en **Add Rule**, en el campo "Type" seleccione **HTTPS** y deje los otros campos con el valor por defecto
- __2.14.__ Haga click en **Review and Launch** y después en **Launch**
- __2.15.__ Remplaze la opción "Choose an existing key pair" por **Proceed without a key pair**
- __2.16.__ Seleccione **I acknowledge that I will not (...)** y haga click en **Launch Instance**
- __2.17.__ Haga click en **View Instances**
- __2.18.__ Seleccione la instancia con nombre **webserver1**
- __2.19.__ Haga click en **Actions**, seleccione **Networking** y haga click en **Change Security Groups**
- __2.20.__ Deje seleccionado el Security Group **webserver1-sg** y seleccione también el grupo **cloudhsm-cluster-&lt;cluster id&gt;-sg
- __2.21.__ Haga click en **Assign Security Groups**
- __2.22.__ Tome nota de la dirección IP publica en **IPv4 Public IP**

Entre **IP Address**: <input type="text" id="instance-ip" onkeyup="copyval(this);"/><br>
<br>
</details>

### 3. Haga la configuración del webserver1
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

Entre **su user id**: <input type="text" id="user-id" onkeyup="copyval(this);"/><br>
Entre **HSM IP Address**: <input type="text" id="cloudhsm-ip" onkeyup="copyval(this);"/><br>
<br>

- __3.1.__ Vuelva a pestaña o ventana del navegador del [AWS Systems Manager](https://console.aws.amazon.com/systems-manager/home)
- __3.2.__ Haga click en **Start session**
- __3.3.__ Seleccione el **webserver1** y haga click en **Start session**
- __3.4.__ Haga click en la terminal y digite:

    cd &lt;enter&gt;

- __3.5.__ Actualize el software del Sistema Operativo y instale las librerias de CloudHSM y nginx

    sudo yum update -y<br>
    wget https://s3.amazonaws.com/cloudhsmv2-software/CloudHsmClient/EL6/cloudhsm-client-latest.el6.x86_64.rpm<br>
    wget https://s3.amazonaws.com/cloudhsmv2-software/CloudHsmClient/EL7/cloudhsm-client-dyn-latest.el7.x86_64.rpm<br>
    sudo yum install ./cloudhsm-client-latest.el6.x86_64.rpm -y<br>
    sudo yum install -y ./cloudhsm-client-dyn-latest.el7.x86_64.rpm<br>
    sudo amazon-linux-extras install nginx1.12 -y<br>

- __3.6.__ Configure el cliente del CloudHSM con los comandos:

    sudo aws s3 cp s3://crypto-<span class="user-id">&lt;su_user_id&gt;</span>/customerCA.crt /opt/cloudhsm/etc/customerCA.crt<br>
    sudo /opt/cloudhsm/bin/configure -a <span class="cloudhsm-ip">&lt;su_user_id&gt;</span><br>
    sudo systemctl start cloudhsm-client<br>

- __3.7.__ Cree una carpeta y copie los archivos de certificados y llaves necesarios desde el bucket S3 con los comandos:

    sudo mkdir -p /etc/pki/nginx/private<br>
    sudo aws s3 cp s3://crypto-<span class="user-id">&lt;su_user_id&gt;</span>/fake_pem.key /etc/pki/nginx/private/server.key<br>
    sudo aws s3 cp s3://crypto-<span class="user-id">&lt;su_user_id&gt;</span>/webserver.crt /etc/pki/nginx/server.crt<br>

- __3.8.__ Cambie la configuración de permisos del archivo de llaves fake:

    sudo chown nginx /etc/pki/nginx/server.crt /etc/pki/nginx/private/server.key<br>

- __3.9.__ Cambie el archivo de configuración del nginx para usar el engine de CloudHSM

    sudo sed -i '5issl_engine cloudhsm;' /etc/nginx/nginx.conf<br>

- __3.10.__ Remueva los comantarios de la sección del servicio HTTPS del nginx:

    sudo nano /etc/nginx/nginx.conf<br>

Desca hasta la linea siguiente a **# Settings for a TLS enabled server.** y usando **Ctrl+d** para quitar los caracteres "#". Para grabar use **Ctrl+s** y para salir **Ctrl+x**

- __3.11.__ Cambie los archivos de configuración del nginx con los comandos:

    sudo sed -i '11iEnvironmentFile=/etc/sysconfig/nginx' /lib/systemd/system/nginx.service<br>
    echo 'n3fips_password=webserver1:defaultPassword' | sudo tee -a /etc/sysconfig/nginx<br>

- __3.12.__ Inicie el servicio nginx

    sudo systemctl start nginx<br>

- __3.13.__ Pruebe si el servicio funciona correctamente en [https://<span class="instance-ip">&lt;instance Public IP&gt;</span>](https://<span class="instance-ip">&lt;instance Public IP&gt;</span>/)<br>

- __3.14.__ Accepte el certificado digital auto-firmado haciendo click en **Advanced...** y **Accept the Risk and Continue**
</details>