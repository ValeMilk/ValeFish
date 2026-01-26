import { Schema, model } from 'mongoose';

interface IUser {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'operador';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
