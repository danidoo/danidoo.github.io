## Gestión llaves

### 1. Creando llaves en el HSM
<details open>
<summary><strong>(detalles)</strong></summary>
<br />
En este modulo se creará varios tipos de llaves (simetricas y asimétricas)

- __1.1.__ Vuelva a la pestaña o ventana del navegador del [AWS Systems Manager](https://console.aws.amazon.com/ssm/home) en la terminal de la instancia
- __1.2.__ Inicie el servicio cliente del CloudHSM

    sudo systemctl start cloudhsm-client

- __1.3.__ Inicie el agente de gestión de llaves

    ./key_mgmt_util

- __1.4.__ Haga login con el usuario crypto user creado

    loginHSM -u CU -s user1 -p defaultPassword

- __1.5.__ Genere una llave simetrica AES-256 con el comando:

    genSymKey -t 31 -s 32 -l aes256

Entre el **Key Handle** de esa llave: <input type="text" id="aes-256-key-handle" onkeyup="copyval(this);"/><br>
<br>

- __1.6.__ Genere una llave asimétrica RSA con el comando:

    genRSAKeyPair -m 2048 -e 65541 -l rsa_test

Entre el **Key Handle** de esa llave: <input type="text" id="rsa-key-handle" onkeyup="copyval(this);"/><br>
<br>

- __1.7.__ Genere una llave de curva elíptica con el comando:

    genECCKeyPair -i 12 -l ecc12

- __1.8.__ Saiga del agente con el comando:

    exit
</details>

### 2. Importando una llave AES-256 al CloudHSM
<details open>
<summary><strong>(detalles)</strong></summary>
<br />
En este modulo se va a importar una llave simetrica AES-256 al CloudHSM

- __2.1.__ Vuelva a la pestaña o ventana del navegador del [AWS Systems Manager](https://console.aws.amazon.com/ssm/home) en la terminal de la instancia
- __2.2.__ Genere una llave simetrica AES-256 para importación con la herramienta openssl

    openssl rand -out aes256-forImport.key 32

- __2.3.__ Inicie el agente de gestión de llaves

    ./key_mgmt_util

- __2.4.__ Haga login con el usuario crypto user creado

    loginHSM -u CU -s user1 -p defaultPassword

- __2.5.__ Use el comando imSymKey para importar al CloudHSM la llave AES-256 generada con openssl en el paso anteriormente.

    imSymKey -f aes256-forImport.key -w <span class="wrapping-key-handle">&lt;wrapping key handle&gt;</span> -t 31 -l imported
</details>

### 3. Exportando la llave AES-256 del CloudHSM
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __3.1.__ Genere una wrapping key en el CloudHSM y tome nota de su **key handle**

    genSymKey -t 31 -s 32 -l wrappingKey

Llene el **Key Handle** del wrapping key: <input type="text" id="wrapping-key-handle" onkeyup="copyval(this);"/><br>
<br>

- __3.2.__ Exporte en texto plano la llave AES-256 creada anteriormente (key handle -k). El agente usa una llave AES-256 de wrapping creada anteriormente(key handle -w) en el CloudHSM. Entonces escribe la llave en texto plano al archivo AES-256-CHSM-unencrypted.key.

    exSymKey -k <span class="aes-256-key-handle">&lt;AES-256 key handle&gt;</span> -w <span class="wrapping-key-handle">&lt;wrapping key handle&gt;</span> -out AES-256-CHSM-unencrypted.key

- __3.2.__ Importe la llave AES-256 en texto plano creada anteriormente (key handle -k).

    imSymKey -t 31 -f AES-256-CHSM-unencrypted.key -w <span class="wrapping-key-handle">&lt;wrapping key handle&gt;</span> -l imported_fromPlaintext<br>

- __3.3.__ Exporte la misma llave AES-256 de manera cifrada con el comando:

    wrapKey -k <span class="aes-256-key-handle">&lt;AES-256 key handle&gt;</span> -w <span class="wrapping-key-handle">&lt;wrapping key handle&gt;</span> -out AES-256-CHSM-encrypted.key<br>

- __3.4.__ Vuelva a importar esa llave cifrada al CloudHSM:

    unWrapKey -f AES-256-CHSM-encrypted.key -w <span class="wrapping-key-handle">&lt;wrapping key handle&gt;</span><br>

- __3.5.__ Saiga del agente con el comando:

    exit
</details>

### 4. Usando openssl con llaves en el CloudHSM
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

- __4.1.__ Instale la libreria

    wget https://s3.amazonaws.com/cloudhsmv2-software/CloudHsmClient/EL7/cloudhsm-client-dyn-latest.el7.x86_64.rpm<br>
    sudo yum install -y ./cloudhsm-client-dyn-latest.el7.x86_64.rpm<br>

- __4.2.__ Configure las credenciales

    export n3fips_password=user1:defaultPassword<br>

- __4.3.__ Cree un key pair

    openssl genrsa -engine cloudhsm -out fake_pem.key 2048<br>

- __4.4.__ Cree un CSR

    openssl req -engine cloudhsm -new -key fake_pem.key -out webserver.csr<br>

- __4.4.__ Cree un Certificado auto-firmado con el comando:

    openssl x509 -engine cloudhsm -req -days 365 -in webserver.csr -signkey fake_pem.key -out webserver.crt<br>
</details>

### 5. Ponga el certificado y fake_pem en el bucket S3
<details open>
<summary><strong>(detalles)</strong></summary>
<br />

Entre **su user id** de esa llave: <input type="text" id="user-id" onkeyup="copyval(this);"/><br>
<br>

- __5.1.__ Envie el archivo PEM de llave y el certificado generado al bucket S3 con los comandos

    aws s3 cp ./fake_pem.key s3://crypto-<span class="user-id">&lt;su user id&gt;</span>/<br>
    aws s3 cp ./webserver.crt s3://crypto-<span class="user-id">&lt;su user id&gt;</span>/<br>
