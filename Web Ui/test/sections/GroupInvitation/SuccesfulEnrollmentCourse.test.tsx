import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SuccessfulEnrollmentPopUp from '../../../src/sections/GroupInvitation/components/SuccessfulEnrollmentPopUp';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios');

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    onAuthStateChanged: jest.fn((_, func) => {
        func(null);
        return jest.fn();
    }),
}));

jest.mock('../../../src/firebaseConfig', () => {
    return {
        __esModule: true,
        default: jest.fn(),
    };
});

jest.mock('../../../src/modules/User-Authentication/application/checkIfUserHasAccount.ts', () => ({
    CheckIfUserHasAccount: jest.fn().mockImplementation(() => ({
        userHasAnAccountWithToken: jest.fn().mockResolvedValue(null),
        userHasAnAccountWithGoogleToken: jest.fn().mockResolvedValue(null),
    })),
}));

describe('Succesful Sign Up Pop up component', () => {
    it('Renders basic components', () => {
        const { getByText } = render(
            <MemoryRouter>
                <SuccessfulEnrollmentPopUp/>
            </MemoryRouter>
        );
        const title = getByText(/Inscripción Exitosa/);
        const body = getByText(/Ahora eres parte del grupo/);
        const acceptButton = getByText("Aceptar");
        expect(title).toBeInTheDocument();
        expect(body).toBeInTheDocument();
        expect(acceptButton).toBeInTheDocument();
    });
});