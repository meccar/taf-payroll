export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly confirmationToken: string,
  ) {}
}

export class PasswordResetRequestedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly resetToken: string,
  ) {}
}

export class EmailConfirmationRequestedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly confirmationToken: string,
  ) {}
}
