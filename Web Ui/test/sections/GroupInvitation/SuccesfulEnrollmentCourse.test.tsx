import { render, fireEvent , waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import SuccessfulEnrollmentPopUp from '../../../src/sections/GroupInvitation/components/SuccessfulEnrollmentPopUp';
import { MemoryRouter } from 'react-router-dom';

describe('Succesful Sign Up Pop up component', () => {
    it('Renders basic components', () => {
        const { getByText } = render(
            <MemoryRouter>
                <SuccessfulEnrollmentPopUp/>
            </MemoryRouter>
        );
        const title = getByText(/Inscripción Exitosa/);
        const body = getByText(/Ahora eres parte del grupo . Ya puedes aprender y mejorar tus skills de programación con las tareas del curso./);
        const acceptButton = getByText("Aceptar");
        expect(title).toBeInTheDocument();
        expect(body).toBeInTheDocument();
        expect(acceptButton).toBeInTheDocument();
    });

    it('Renders click accept button', () => {
        const { getByText } = render(
            <MemoryRouter>
                <SuccessfulEnrollmentPopUp/>
            </MemoryRouter>
        );
        waitFor(() => {
            const acceptButton = getByText('Aceptar');
            expect(acceptButton).toBeInTheDocument();
            const open = true;
            fireEvent.click(acceptButton);
            expect(open).toBe(false);
        })
    });

    it('Renders click accept button and go to homepage', () => {
        const { getByText } = render(
            <MemoryRouter>
                <SuccessfulEnrollmentPopUp/>
            </MemoryRouter>
        );
        waitFor(() => {
            const acceptButton = getByText('Aceptar');
            expect(acceptButton).toBeInTheDocument();
            const oldPathname = window.location.pathname;
            fireEvent.click(acceptButton);
            const newPathname = window.location.pathname;
            const expectedLastPart = '';
            const actualLastPart = newPathname.substring(newPathname.lastIndexOf('/') + 1);
            expect(oldPathname).not.toBe(newPathname);
            expect(actualLastPart).toBe(expectedLastPart);
        })
    });
});