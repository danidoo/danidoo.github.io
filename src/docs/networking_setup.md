
### Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16<br>

Enter VPC Id from output: <input type="text" id="vpc-id" onkeyup="copyval(this);"/><br>
<br>
aws ec2 modify-vpc-attribute --enable-dns-hostnames --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>
aws ec2 create-tags --resources <span class="vpc-id">vpc-XXXXXXXXXXXX</span>--tags Key=Name,Value=cloudhsm-vpc<br>

### Create protected subnets
aws ec2 describe-availability-zones --region us-east-1<br>
aws ec2 create-subnet --availability-zone us-east-1a --cidr-block 10.0.0.0/24 --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>
aws ec2 create-subnet --availability-zone us-east-1b --cidr-block 10.0.1.0/24 --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>
aws ec2 create-subnet --availability-zone us-east-1c --cidr-block 10.0.2.0/24 --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>
aws ec2 create-subnet --availability-zone us-east-1d --cidr-block 10.0.3.0/24 --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>
aws ec2 create-subnet --availability-zone us-east-1e --cidr-block 10.0.4.0/24 --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>
aws ec2 create-subnet --availability-zone us-east-1f --cidr-block 10.0.5.0/24 --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>

### Create private subnets
aws ec2 create-subnet --availability-zone us-east-1a --cidr-block 10.0.128.0/24 --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>

Enter Subnet Id from output: <input type="text" id="priv-subnet-1a-id" onkeyup="copyval(this);"/><br>
<br>
aws ec2 create-subnet --availability-zone us-east-1b --cidr-block 10.0.129.0/24 --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>

Enter Subnet Id from output: <input type="text" id="priv-subnet-1b-id" onkeyup="copyval(this);"/><br>
<br>

### Tag private subnets
aws ec2 create-tags --resources <span class="priv-subnet-1a-id">subnet-XXXXXXXXXXXX</span> --tags Key=Name,Value=private-subnet-us-east-1a<br>
aws ec2 create-tags --resources <span class="priv-subnet-1b-id">subnet-XXXXXXXXXXXX</span> --tags Key=Name,Value=private-subnet-us-east-1b<br>

### Create Security Groups for VPC Endpoints
aws ec2 create-security-group --group-name vpc-endpoints --description "For communication with VPC Endpoints" --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>

Enter Security Group Id from output: <input type="text" id="sg-id" onkeyup="copyval(this);"/><br>
<br>
aws ec2 authorize-security-group-ingress --group-id <span class="sg-id">sg-XXXXXXXXXXXX</span> --cidr '10.0.0.0/16' --protocol tcp --port 443<br>


### Create VPC Endpoints to manage EC2 instances through Session Manager
aws ec2 describe-vpc-endpoint-services<br>
aws ec2 create-vpc-endpoint --vpc-endpoint-type Interface --private-dns-enabled --service-name com.amazonaws.us-east-1.ec2 --security-group-ids <span class="sg-id">sg-XXXXXXXXXXXX</span> --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span> --subnet-ids <span class="priv-subnet-1a-id">subnet-XXXXXXXXXXXX</span> <span class="priv-subnet-1b-id">vpc-XXXXXXXXXXXX</span><br>
aws ec2 create-vpc-endpoint --vpc-endpoint-type Interface --private-dns-enabled --service-name com.amazonaws.us-east-1.ec2messages --security-group-ids <span class="sg-id">sg-XXXXXXXXXXXX</span> --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span> --subnet-ids <span class="priv-subnet-1a-id">subnet-XXXXXXXXXXXX</span> <span class="priv-subnet-1b-id">vpc-XXXXXXXXXXXX</span><br>

aws ec2 create-vpc-endpoint --vpc-endpoint-type Interface --private-dns-enabled --service-name com.amazonaws.us-east-1.ssm --security-group-ids <span class="sg-id">sg-XXXXXXXXXXXX</span> --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span> --subnet-ids <span class="priv-subnet-1a-id">subnet-XXXXXXXXXXXX</span> <span class="priv-subnet-1b-id">vpc-XXXXXXXXXXXX</span><br>
aws ec2 create-vpc-endpoint --vpc-endpoint-type Interface --private-dns-enabled --service-name com.amazonaws.us-east-1.ssmmessages --security-group-ids <span class="sg-id">sg-XXXXXXXXXXXX</span> --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span> --subnet-ids <span class="priv-subnet-1a-id">subnet-XXXXXXXXXXXX</span> <span class="priv-subnet-1b-id">vpc-XXXXXXXXXXXX</span><br>

### Create public subnets
aws ec2 create-subnet --availability-zone us-east-1a --cidr-block 10.0.192.0/24 --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>

Enter Subnet Id from output: <input type="text" id="pub-subnet-1a-id" onkeyup="copyval(this);"/><br>
<br>
aws ec2 create-subnet --availability-zone us-east-1b --cidr-block 10.0.193.0/24 --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>

Enter Subnet Id from output: <input type="text" id="pub-subnet-1b-id" onkeyup="copyval(this);"/><br>
<br>

aws ec2 create-tags --resources <span class="pub-subnet-1a-id">subnet-XXXXXXXXXXXX</span> --tags Key=Name,Value=public-subnet-us-east-1a<br>
aws ec2 create-tags --resources <span class="pub-subnet-1b-id">subnet-XXXXXXXXXXXX</span> --tags Key=Name,Value=public-subnet-us-east-1b<br>

### Create and attach internet gateway to VPC
aws ec2 create-internet-gateway<br>

Enter Subnet Id from output: <input type="text" id="igw-id" onkeyup="copyval(this);"/><br>
<br>
aws ec2 attach-internet-gateway --internet-gateway-id <span class="igw-id">igw-XXXXXXXXXXXX</span>  --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>

### Set Subnets for auto public IP assignment
aws ec2 modify-subnet-attribute --map-public-ip-on-launch --subnet-id <span class="pub-subnet-1a-id">subnet-XXXXXXXXXXXX</span><br>
aws ec2 modify-subnet-attribute --map-public-ip-on-launch --subnet-id <span class="pub-subnet-1b-id">subnet-XXXXXXXXXXXX</span><br>

### Allocate Elastic IP and create NAT Gateway
aws ec2 allocate-address

Enter Elastic IP Id from output: <input type="text" id="eip-id" onkeyup="copyval(this);"/><br>
<br>
aws ec2 create-nat-gateway --allocation-id <span class="eip-id">subnet-XXXXXXXXXXXX</span> --subnet-id <span class="pub-subnet-1a-id">subnet-XXXXXXXXXXXX</span><br>

Enter NAT Gateway Id from output: <input type="text" id="natgw-id" onkeyup="copyval(this);"/><br>
<br>

### Create Route Table for public subnet
aws ec2 create-route-table --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>

Enter Route Table Id from output: <input type="text" id="rtb-pub-id" onkeyup="copyval(this);"/><br>
<br>
aws ec2 create-tags --resources <span class="rtb-pub-id">rtb-XXXXXXXXXXXX</span> --tags Key=Name,Value=public-route-table<br>
aws ec2 create-route --destination-cidr-block 0.0.0.0/0 --gateway-id <span class="igw-id">igw-XXXXXXXXXXXX</span> --route-table-id <span class="rtb-pub-id">rtb-XXXXXXXXXXXX<span><br>
aws ec2 associate-route-table --route-table-id <span class="rtb-pub-id">rtb-XXXXXXXXXXXX</span> --subnet-id <span class="pub-subnet-1a-id">subnet-XXXXXXXXXXXX</span><br>
aws ec2 associate-route-table --route-table-id <span class="rtb-pub-id">rtb-XXXXXXXXXXXX</span> --subnet-id <span class="pub-subnet-1b-id">subnet-XXXXXXXXXXXX</span><br>

### Create Route Table for private subnet
aws ec2 create-route-table --vpc-id <span class="vpc-id">vpc-XXXXXXXXXXXX</span><br>

Enter Route Table Id from output: <input type="text" id="rtb-priv-id" onkeyup="copyval(this);"/><br>
<br>
aws ec2 create-tags --resources <span class="rtb-priv-id">rtb-XXXXXXXXXXXX</span> --tags Key=Name,Value=private-route-table<br>
aws ec2 create-route --destination-cidr-block 0.0.0.0/0 --nat-gateway-id <span class="natgw-id">nat-XXXXXXXXXXXX</span>  --route-table-id <span class="rtb-priv-id" >rtb-XXXXXXXXXXXX</span><br>
aws ec2 associate-route-table --route-table-id <span class=="rtb-priv-id">rtb-XXXXXXXXXXXX</span> --subnet-id <span class="priv-subnet-1a-id">subnet-XXXXXXXXXXXX</span><br>
aws ec2 associate-route-table --route-table-id <span class="rtb-priv-id" >rtb-XXXXXXXXXXXX</span> --subnet-id <span class="priv-subnet-1b-id">subnet-XXXXXXXXXXXX</span><br>