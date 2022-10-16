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
Miller is a bot that lists and ping people that did not send any message in a specific channel.
It is used for event registration.
When a channel is created for a specific event, everyone is asked to announce their participation or not and if so, to select an available slot.



Commands
--------

- !presence
- !recap (#channel optionnal parameter)

Experimental:
-------------
- !absent (@user, on/off, date end)
- !absences
> list absences
- !event
> Create Discord event for next saturday:16:30 by default.

BUG TO FIX:
-----------
- Handle json error
- InitGuys like recap does

TODO:
-----------
- Creer commande liste all white listed ?
