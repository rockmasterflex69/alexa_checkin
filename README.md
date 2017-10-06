# alexa_checkin

This is a lambda function for an alexa skill designed to facilitate the automatic entry of users into a queue along with associated data pertinent to whatever experience they are queueing for. 

# Theoretical Stuff
  - based on retail store
  - customers can book a slot with the next available employee
  - employees can see pertinent info on the customers in the queue to speed up the process
  - customers can also ask "easy" questions and have them answered by Alexa to save employee time

# What Actually Works

  - The Intent chain starting with ServiceIntent seems to work correctly when tested in lambda directly? Don't talk to me about how it works once it gets wired up to the alexa skill...

# What isn't done or rustles my jimmies
  - the beta dialog builder in the Alexa skill kit is infuriating. See NeedEmployeeIntent for frustration in code.
  - yes and no intents don't exist in the beta skill builder. this is baffling to me.
  - no db connection yet. Planned but basically a stretch goal because not necessary for full demo
  - no connected web ui for employees to interact with the queue
  - no meaningful dialog chains yet, see point one and two in this section.
