FROM ubuntu:latest

RUN apt-get update && apt-get install -y openssh-server
RUN mkdir /var/run/sshd

# Create a new user called "ubuntu" without sudo privileges
# RUN useradd -rm -d /home/ubuntu -s /bin/bash -u 1000 ubuntu
RUN echo 'ubuntu:password' | chpasswd

# Update SSH configuration to allow password authentication
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]
