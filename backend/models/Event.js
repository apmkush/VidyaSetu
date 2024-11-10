import { Schema, model } from 'mongoose';

const eventSchema = new Schema({
    eventName: {
        type: String,
        required: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    eventType: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const Event = model('Event', eventSchema);

export {Event};