# Deploy

## requirements

install `sshpass` and [ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

```bash
aptitude install sshpass
```

## run

```bash
ansible-playbook -i production.hosts deploy.yml
```

## Notes

The task "Delete old pm2 process" could generate errors in the first deploy
(or whenever the process is not already running), but this is completely normal
and the error is ignored.

----
