# Deploy

## requirements

install `sshpass` and [ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

```bash
aptitude install sshpass
```

## add ssh-agent

The ssh-agent must be forwarded in order to clone the repo in the remote
machine, in order to do this, you should add your ssh-agent:

```bash
ssh-add ~/.ssh/id_rsa
```

## run

All the setup is ready but you need to add the ssh pasword as an extra var:

```bash
ansible-playbook -i production.hosts deploy.yml --extra-vars "ansible_ssh_pass=YOUR_PASS_HERE"
```

## Notes

The task "Delete old pm2 process" could generate errors in the first deploy
(or whenever the process is not already running), but this is completely normal
and the error is ignored.

----
