import type { AuthResponse, User } from "~/types";

export const useAuth = () => {
	const token = useCookie<string | null>("auth_token", {
		default: () => null,
		maxAge: 60 * 60 * 24 * 7,
	});

	const isAuthenticated = computed(() => !!token.value);

	const setAuthData = (authData: AuthResponse) => {
		token.value = authData.access_token;
	};

	const getToken = () => {
		return token.value;
	}

	const clearAuthData = () => {
		token.value = null;
	};

	const loginByEmail = async (
		email: string,
		password: string
	): Promise<AuthResponse> => {
		const api = useApi();

		const response = await api<AuthResponse>("/auth/login-email", {
			method: "POST",
			body: { email, password },
		});

		setAuthData(response);
		return response;
	};

	const loginByPhoneSendCode = async (phone: string): Promise<any> => {
		const api = useApi();
		return await api("/auth/login-phone/code", {
			method: "POST",
			body: { phone },
		});
	};

	const loginByPhoneConfirmCode = async (
		code: string
	): Promise<AuthResponse> => {
		const api = useApi();

		const response = await api<AuthResponse>("/auth/login-phone/confirm", {
			method: "POST",
			body: { code },
		});

		setAuthData(response);
		return response;
	};

	const registerSendCode = async (data: {
		phone: string;
	}): Promise<any> => {
		const api = useApi();
		return await api("/auth/register/code", {
			method: "POST",
			body: data,
		});
	};

	const registerConfirmCode = async (code: string): Promise<AuthResponse> => {
		const api = useApi();

		const response = await api<AuthResponse>("/auth/register/confirm", {
			method: "POST",
			body: { code },
		});

		setAuthData(response);
		return response;
	};

	const register = async (data: {
		firstname: string;
		lastname: string;
		password: string;
	}): Promise<any> => {
		const api = useApi();
		return await api("/auth/register", {
			method: "POST",
			body: data,
		});
	};

	const logout = async () => {
		clearAuthData();
		await navigateTo("/auth/login");
	};

	const initAuth = () => {
		if (process.client && token.value) {
			return;
		}
	};

	return {
		token,
		isAuthenticated,
		setAuthData,
		clearAuthData,
		loginByEmail,
		loginByPhoneSendCode,
		loginByPhoneConfirmCode,
		registerSendCode,
		registerConfirmCode,
		register,
		logout,
		initAuth,
		getToken
	};
};
