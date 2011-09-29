# RescueFox, a Prototype WebGL game

RescueFox was written as part of the [Paladin Project](https://wiki.mozilla.org/Paladin). 
See [our blog post](http://mozillalabs.com/blog/2011/09/rescuefox-the-value-of-a-prototype/)
for more details about the prototype itself as well as the writing of it 
and what we learned.

http://rescuefox.mozillalabs.com/ is a playable copy.  It works in current
versions of Firefox.  A quick test on MacOS Chrome shows that it appears to
appears to work there as well, albeit more slowly and without the background music.

Note that we think we've learned much of what we can from RescueFox and don't
intend to drive it forward any further at this point (though that shouldn't
stop anyone who feels inclined to fork it).  But we'll be prototyping another
microgame soon once the [Gladius](https://github.com/alankligman/gladius)
refactoring is a bit further along, and we'll be very interested in having
folks help out there...

https://www.pivotaltracker.com/projects/337777 is where a lot of the work
happened.

# Hacking on it

After cloning this repo, run "make submodule" to clone or update the repos that
this code depends on (eg CubicVR, Gladuis).  Then fire up a web-browser, and
surf to the src/ directory to play or test changes that you've me.

