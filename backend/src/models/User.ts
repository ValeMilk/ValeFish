import { Schema, model } from 'mongoose';

interface IUser {
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'operador';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'operador'],
      default: 'operador',
    },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
