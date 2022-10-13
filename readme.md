README
======

- Copy/Paste .env & auth.json
- npm i
- node index.js

> config dans package.json
>
> run the bot file



Meet Miller
-----------
Miller is a bot that lists and ping people that have not send any message in a specific channel.
It is used for event registering when a channel is created for a specific event.
The need of this bot comes from organisation of Arma missions.

Commands
--------

- !presence
- !recap (#channel optionnal parameter)

Experimental:
------------------~~~~
- !absent (@user, on/off, date end)
- !absences
> list absences

BUG TO FIX:
-----------
- Handle json format error
- InitGuys like recap does
- HasException only set at creation, but not updated

TODO:
-----------
- Create regular event with week day as parameter.
- Creer commande liste all white listed
