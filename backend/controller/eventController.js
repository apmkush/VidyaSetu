
import {Event} from "../models/Event.js";



export const createEvent = async (req, res) => {
    try {
      const { eventName, eventDate, eventType } = req.body;
      const event = new Event({ eventName, eventDate, eventType });
      await event.save();   
      res.json({ success: true, message: "Event created successfully!" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Failed to create event" });
    }
  };
  
  export const getEvents = async (req, res) => {
    try {
      const events = await Event.find();
      res.json(events);
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Failed to fetch events" });
    }
  };