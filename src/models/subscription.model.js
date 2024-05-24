import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: { //the user who is subscribing
        type: Schema.Types.ObjectId,
        ref: "User",
        // required: true
    },
    channel: { //the channel to whom the user is subscribing
        type: Schema.Types.ObjectId,
        ref: "User",
        // required: true
    }
},{timeseries:true});

export const subscription = mongoose.model('Subscription', subscriptionSchema);