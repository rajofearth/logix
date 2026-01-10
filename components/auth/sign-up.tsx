"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { authClient, signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { uploadFiles } from "@/lib/uploadthing";
import Link from "next/link";

export default function SignUp() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");
	const [image, setImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSignUp = async () => {
		if (password !== passwordConfirmation) {
			toast.error("Passwords do not match");
			return;
		}

		await signUp.email({
			email,
			password,
			name: `${firstName} ${lastName}`,
			callbackURL: "/dashboard",
			fetchOptions: {
				onResponse: () => {
					setLoading(false);
				},
				onRequest: () => {
					setLoading(true);
				},
				onError: (ctx) => {
					toast.error(ctx.error.message);
				},
				onSuccess: async () => {
					if (image) {
						try {
							const uploaded = await uploadFiles("adminProfilePicture", {
								files: [image],
							});
							const url = uploaded?.[0]?.ufsUrl;
							if (!url) throw new Error("Upload succeeded but URL is missing");

							await authClient.updateUser({ image: url });
						} catch (e) {
							const message =
								e instanceof Error ? e.message : "Failed to upload profile image";
							toast.error(message);
						}
					}

					router.push("/dashboard");
				},
			},
		});
	};

	return (
		<div className="window active" style={{ maxWidth: "450px", margin: "auto" }}>
			<div className="title-bar">
				<div className="title-bar-text">Create Account</div>
				<div className="title-bar-controls">
					<button aria-label="Minimize"></button>
					<button aria-label="Close"></button>
				</div>
			</div>
			<div className="window-body has-space">
				<p style={{ marginBottom: "16px" }}>
					Enter your information to create an account
				</p>

				{/* Name fields - side by side */}
				<div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
					<div className="group" style={{ flex: 1 }}>
						<label htmlFor="first-name">First name:</label>
						<input
							id="first-name"
							type="text"
							placeholder="Max"
							required
							onChange={(e) => setFirstName(e.target.value)}
							value={firstName}
							style={{ width: "100%", boxSizing: "border-box" }}
						/>
					</div>
					<div className="group" style={{ flex: 1 }}>
						<label htmlFor="last-name">Last name:</label>
						<input
							id="last-name"
							type="text"
							placeholder="Robinson"
							required
							onChange={(e) => setLastName(e.target.value)}
							value={lastName}
							style={{ width: "100%", boxSizing: "border-box" }}
						/>
					</div>
				</div>

				<div className="group" style={{ marginBottom: "12px" }}>
					<label htmlFor="email">Email:</label>
					<input
						id="email"
						type="text"
						placeholder="m@example.com"
						required
						onChange={(e) => setEmail(e.target.value)}
						value={email}
						style={{ width: "100%", boxSizing: "border-box" }}
					/>
				</div>

				<div className="group" style={{ marginBottom: "12px" }}>
					<label htmlFor="password">Password:</label>
					<input
						id="password"
						type="password"
						placeholder="Password"
						autoComplete="new-password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						style={{ width: "100%", boxSizing: "border-box" }}
					/>
				</div>

				<div className="group" style={{ marginBottom: "12px" }}>
					<label htmlFor="password_confirmation">Confirm Password:</label>
					<input
						id="password_confirmation"
						type="password"
						placeholder="Confirm Password"
						autoComplete="new-password"
						value={passwordConfirmation}
						onChange={(e) => setPasswordConfirmation(e.target.value)}
						style={{ width: "100%", boxSizing: "border-box" }}
					/>
				</div>

				{/* Profile Image */}
				<fieldset style={{ marginBottom: "12px" }}>
					<legend>Profile Image (optional)</legend>
					<div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
						{imagePreview && (
							<div style={{
								width: "64px",
								height: "64px",
								overflow: "hidden",
								border: "2px inset",
								flexShrink: 0
							}}>
								<Image
									src={imagePreview}
									alt="Profile preview"
									width={64}
									height={64}
									style={{ objectFit: "cover", width: "100%", height: "100%" }}
								/>
							</div>
						)}
						<div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
							<input
								id="image"
								type="file"
								accept="image/*"
								onChange={handleImageChange}
								style={{ flex: 1 }}
							/>
							{imagePreview && (
								<button
									type="button"
									onClick={() => {
										setImage(null);
										setImagePreview(null);
									}}
								>
									Clear
								</button>
							)}
						</div>
					</div>
				</fieldset>

				<section style={{ display: "flex", justifyContent: "flex-end", gap: "6px", marginTop: "16px" }}>
					<button
						className="default"
						disabled={loading}
						onClick={handleSignUp}
					>
						{loading ? (
							<>
								<Loader2 size={16} className="animate-spin" style={{ marginRight: "4px", display: "inline-block" }} />
								Creating...
							</>
						) : (
							"Create an account"
						)}
					</button>
				</section>

				<div style={{ textAlign: "center", marginTop: "16px", fontSize: "12px" }}>
					<p>
						Already have an account?{" "}
						<Link href="/auth/sign-in">
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}