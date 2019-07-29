## Inicialización del Cluster
En este laboratório se hará la inicialización de un cluster de CloudHSM.

### 1. Cree una VPC
<details open>
<summary><strong>(detalles)</strong></summary>
<br />
Si la infraestructura básica fue creada en el modulo anterior, podrás saltar este paso.

- __1.1.__ En un navegador, abra el sitio <CFN_Github>
- __1.2.__ Haga click en **Raw** e descargue el archivo a su maquina con el nombre cloudhsm-landing-zone.json.
- __1.3.__ Abra la Consola de AWS, en el servicio CloudFormation.
- __1.4.__ Implemente el ambiente de inicio usando el servicio CloudFormation con el archivo descargado.
- __1.5.__ Tome nota del VPC Id que fue creado, y de las 6 subnets
</details>

### 2. Cree un cluster
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __2.1.__ En una nueva pestaña o ventana del navegador, abra la consola de AWS en el servicio [AWS CloudHSM](https://console.aws.amazon.com/cloudhsm/home) en la región de N. Virginia
- __2.2.__ Haga click en **Create cluster**, y usando los Ids del VPC y las subnets, elija los parametros adecuados
- __2.3.__ Deje la opción **Create new cluster** seleccionada y haga click en **Next: Review** y después en **Create cluster**
- __2.4.__ La creación del cluster puede llevar hasta 10 minutos. Siga con la proxima etapa mientras el proceso sigue.
</details>

### 3. Cree un bucket S3 para almacenamiento de objetos
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __3.1.__ En una nueva pestaña o ventana del navegador, abra la consola de AWS en el servicio [Amazon S3](https://console.aws.amazon.com/s3/home)
- __3.2.__ Haga click en **Create bucket**
- __3.2.__ En **Bucket name** llene con el nombre **crypto-&lt;su_userid&gt;** (los buckets tinen que tener nombres únicos globalmente)
- __3.2.__ Elija la región **US East (N. Virginia)**
- __3.2.__ Haga click en **Create**
</details>

### 4. Cree una politica IAM de acceso al bucket S3 creado anteriormente
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __4.1.__ En una nueva pestaña o ventana del navegador, abra la consola de AWS, en el servicio [Amazon IAM](https://console.aws.amazon.com/iam/home)
- __4.2.__ Haga click en **Policies** en el menu lateral y después en **Create policy**
- __4.3.__ Haga click en **Choose a service**, filtre por **S3** haga click en **S3**
- __4.4.__ Seleccione **All S3 actions (s3:*)**
- __4.5.__ Haga click **Resources** y despues en **Add ARN** del item **bucket**
- __4.6.__ En **Bucket name** llene con el nombre del bucket creado anteriormente (**crypto-&lt;su_userid&gt;**) y haga click en **Add**
- __4.7.__ Haga click en **Add ARN** del item **object**
- __4.8.__ En **Bucket name** llene con el nombre del bucket creado anteriormente (**crypto-&lt;su_userid&gt;**)
- __4.9.__ En **Object name** seleccione **Any** y haga click en **Add**
- __4.10.__ Haga click en **Review policy**
- __4.11.__ En **Name** llene con el nombre **S3CryptoBucket** y después en **Create policy**
</details>

### 5. Cree un role IAM para instancias EC2 gestionadas por el SSM Systems Manager
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __5.1.__ Aún en la consola del servicio [Amazon IAM](https://console.aws.amazon.com/iam/home)
- __5.2.__ Haga click en **Roles** en el menu lateral y después en **Create role**
- __5.3.__ Haga click en **EC2** y después en **Next: Permissions**
- __5.4.__ Filtre las politicas por **ssm** y elija la politica **AmazonEC2RoleforSSM**
- __5.5.__ Filtre de nuevo por **cloudhsm** y elija la politica **AWSCloudHSMFullAccess**
- __5.6.__ Filtre de nuevo por **s3** y elija la politica creada en la etapa anterior **S3CryptoBucket**
- __5.7.__ Haga click en **Next: Tags** y después en **Next: Review**
- __5.8.__ En **Role name** llene con el nombre **EC2-SSM+S3Crypto** y haga click en **Create role**
</details>

### 6. Cree un CloudHSM en el cluster
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __6.1.__ Vuelva a la pestaña del servicio AWS CloudHSM
- __6.2.__ Cuando el estado del cluster figure **Uninitialized**, haga click en **Initialize**
- __6.3.__ Cree un nuvo CloudHSM en el cluster, seleccionando la subnet en la AZ **us-east-1a** y haciendo click en **Create** (Si recibes el mensaje "CreateHsm request failed", elija la siguiente AZ - b, c...)
- __6.4.__ El processo de creación de un nuevo CloudHSM en el cluster puede llevar cerca de 5 minutos. Siga a la proxima etapa mientras el proceso sigue.
</details>

### 7. Cree una instancia EC2 para gestión del CloudHSM
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __7.1.__ Abra la consola AWS el servicio [Amazon EC2](https://console.aws.amazon.com/vpc/home).
- __7.2.__ Haga click en **Running Instances** y después en **Launch Instance**.
- __7.3.__ Seleccióne la versión de Sistema Operativo **Amazon Linux 2 AMI (64-bit x86)** haciendo click en **Select** al lado de esta versión de AMI.
- __7.4.__ En el tipo de instancia, dele seleccionado **t2.micro** y haga click en **Next: Configure Instance Details**
- __7.5.__ En **Network** elija la VPC con nombre **cloudhsm-vpc**
- __7.6.__ En **Subnet** elija la subnet **private-subnet-us-east-1b** (o preferencialmente la de la región donde fue creado el CloudHSM)
- __7.7.__ En **IAM role** elija el perfil creado anteriormente **EC2-SSM+S3Crypto** y haga click en **Next: Add Storage**
- __7.8.__ Haga click en **Next Add Tags** y después en **Add Tag**
- __7.9.__ En el campo **Key** llene con **Name** y en el campo **Value** llene con el nombre **cloudhsm-mgmt**
- __7.10.__ Haga click en **Next: Configure Security Group**
- __7.11.__ Deje seleccionado **Create a new security group**
- __7.12.__ En **Security group name** llene con el nombre **cloudhsm-mgmt-sg**
- __7.13.__ En **Description** llene con **CloudHSM Management Group**
- __7.14.__ Borre la configuración de SSH haciendo click en el **X** al fin de la linea de configuración
- __7.15.__ Haga click en **Review and Launch** y después en **Launch**
- __7.16.__ Remplaze la opción "Choose an existing key pair" por **Proceed without a key pair**
- __7.17.__ Seleccione **I acknowledge that I will not (...)** y haga click en **Launch Instance**
</details>

### 8. Descargue el CSR y lo deje disponible para firmar en el bucket S3
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __8.1.__ Vuelva a la pestaña o ventana del navegador en el servicio [AWS CloudHSM](https://console.aws.amazon.com/cloudhsm/home)
- __8.2.__ Descargue el archivo para firmar el certificado del cluster, haciendo click en **Cluster CSR** y grabelo en tu laptop
- __8.3.__ Vuelva a la pestaña o ventana del navegador en el servicio [S3](https://console.aws.amazon.com/s3/home)
- __8.4.__ Haga click en el bucket creado anteriormente **crypto-&lt;su_userid&gt;**
- __8.5.__ Haga click en **Upload** y despues en **Add files**
- __8.6.__ Elija el archivo con el CSR descargado anteriormente (archivo con un nombre parecido a **cluster-5xr767yr3wr_ClusterCsr.csr**)
- __8.7.__ Haga click en **Upload**
</details>

### 9. Use la instancia de gestión para firmar el CSR
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __9.1.__ Abra una nueva pestaña o ventana del navegador en el servicio [AWS Systems Manager](https://console.aws.amazon.com/systems-manager/home)
- __9.2.__ En el menu lateral, haga click **Session Manager**
- __9.3.__ Haga click en **Start session**
- __9.4.__ Seleccione la instancia con nombre **cloudhsm-mgmt** y haga click en **Start session**
- __9.5.__ Una nueva pestaña se abrirá, haga click en la ventana y ejecute **cd &lt;enter&gt;**
- __9.6.__ Ejecute los comandos:

    sudo yum update -y<br>
    wget https://s3.amazonaws.com/cloudhsmv2-software/CloudHsmClient/EL6/cloudhsm-client-latest.el6.x86_64.rpm<br>
    sudo yum install ./cloudhsm-client-latest.el6.x86_64.rpm -y<br>
    sudo yum install jq -y<br>
    aws configure<br>

- __9.7.__ No cambie las configuraciones estándar **AWS Access Key ID** y **AWS Secret Access Key**
- __9.8.__ En la opción **Default region name** llene con **us-east-1**
- __9.9.__ No cambie las configuracion estándar **Default output format**
- __9.10.__ Ejecute los comandos:

    aws s3 cp s3://crypto-&lt;su_userid&gt;/cluster-&lt;id_del_cluster&gt;_ClusterCsr.csr .

- __9.11.__ Crea un par de llaves y un certificado root con los comandos:

    openssl genrsa -aes256 -out customerCA.key 2048

- __9.12.__ Elija un pass phrase para las llaves

    openssl req -new -x509 -days 3652 -key customerCA.key -out customerCA.crt

- __9.12.__ Use el pass phrase creado anteriormente y elija las opciones que quiera para las preguntas que siguen
- __9.13.__ Firme el CSR con el comando:


    openssl x509 -req -days 3652 -in cluster-&lt;id_del_cluster&gt;_ClusterCsr.csr \<br>
    -CA customerCA.crt \<br>
    -CAkey customerCA.key \<br>
    -CAcreateserial \<br>
    -out CustomerHsmCertificate.crt<br>

- __9.14.__ Use el pass phrase creado anteriormente
- __9.15.__ Inicialice el cluster con el comando:

    aws cloudhsmv2 initialize-cluster --cluster-id cluster-&lt;cluster_id&gt; \<br>
    --signed-cert file://CustomerHsmCertificate.crt \<br>
    --trust-anchor file://customerCA.crt<br>

- __9.16.__ Vuelva a la pestaña o ventana del navegador en el servicio [AWS CloudHSM](https://console.aws.amazon.com/cloudhsm/home)
- __9.17.__ Haga click en el botón de refrescar y vea que el status del cluster esta en **Initialize in progress**
- __9.10.__ El processo de inicialización del cluster puede llevar cerca de 5 minutos. Siga a la proxima etapa mientras el proceso sigue.
</details>

### 10. Use el cliente de CloudHSM para conectar al cluster
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __10.1.__ Vuelva a la pestaña o ventana del navegador del [AWS Systems Manager](https://console.aws.amazon.com/systems-manager/home) en la terminal de la instancia
- __10.2.__ Configure el cliente con el comando:

    sudo cp customerCA.crt /opt/cloudhsm/etc/customerCA.crt

- __10.3.__ 

    echo '#!/bin/sh' >> cloudhsm_mgmt_util.sh<br>
    echo '/opt/cloudhsm/bin/cloudhsm_mgmt_util /opt/cloudhsm/etc/cloudhsm_mgmt_util.cfg' >> cloudhsm_mgmt_util.sh<br>
    chmod +x cloudhsm_mgmt_util.sh<br>
    ln -s /opt/cloudhsm/bin/key_mgmt_util key_mgmt_util<br>

- __10.4.__ Vea la dirección IP del HSM en el cluster con el comando:

    aws cloudhsmv2 describe-clusters | jq '.Clusters[].Hsms[].EniIp'

- __10.5.__ Use la dirección IP del HSM para configurar el agente con el comando

    sudo /opt/cloudhsm/bin/configure -a &lt;IP address&gt;

- __10.6.__ Lanze el agente de gestión del CloudHSM con el comando:
 
    ./cloudhsm_mgmt_util.sh

- __10.7.__ En ese momento no vas a poder conectar pues faltan las reglas de firewall (Security Groups) para acceder al CloudHSM. Lo haremos en el paso siguiente
</details>

### 11. Configure las reglas de firewall para conectar al CloudHSM
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __11.1.__ Vuelva a la pestaña o ventana del navegador en el servicio [AWS EC2](https://console.aws.amazon.com/ec2/home)
- __11.2.__ En el menu lateral haga click en **Instances**
- __11.3.__ Seleccione la instancia con nombre **cloudhsm-mgmt**
- __11.4.__ Haga click en **Actions** y debajo de **Networking** haga click en **Change Security Groups**
- __11.5.__ Seleccione un Security Group adicional con "Group Name" parecido a **cloudhsm-cluster-5xr767yr3wr-sg** (generado automaticamente por el Cluster)
- __11.6.__ Haga click en **Assign Security Groups**
- __11.7.__ Vuelva a la pestaña o ventana del navegador del [AWS Systems Manager](https://console.aws.amazon.com/systems-manager/home) en la terminal de la instancia
- __11.8.__ Intente de nuevo conectar al HSM con el comando:

    ./cloudhsm_mgmt_util.sh

- __11.9.__ Vea los usuarios estándar en el sistema con el comando:

    listUsers

- __11.10.__ Haga login con el usuario y contraseña inicial con el comando:

    loginHSM PRECO admin password

- __11.11.__ Cambie la contraseña con el comando:

    changePswd PRECO admin defaultPassword

- __11.12.__ Cuando recibir el prompt **Do you want to continue(y/n)?** digita **y &lt;enter&gt;
- __11.13.__ Usa el comando “createUser“ para crear un crypto user (CU).

    createUser CU user1 defaultPassword

- __11.14.__ Vea que el CloudHSM cabia el tipo de usuario del crypto officer y muestra el nuevo usuario **user1**:

    listUsers

- __11.15.__ Termine la sesión en el agente con el comando:

    quit