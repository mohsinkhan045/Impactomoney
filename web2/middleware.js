/*
---------------------------------------------------
Project:        FundingProject
Date:           Nov 2, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file holds the Role-based access.
---------------------------------------------------
*/
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET); // Encode the secret key

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Define private routes based on roles
  const protectedRoutes = {
    Beneficiary: ['/beneficiary'],
    Provider: ['/service-provider'],
    Admin: ['/admin'],
  };

  // Get the JWT token from cookies
  const token = request.cookies.get('authToken')?.value;

  if (!token) {
    // Redirect to login if token is missing
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify and decode the token using jose
    const { payload } = await jwtVerify(token, secretKey);
    const userRole = payload.role; // Extract role from the token payload
    console.log('User Role:', userRole);
    console.log('Pathname:', pathname);

    // Check if the user's role matches the protected route
    if (protectedRoutes[userRole]?.includes(pathname)) {
      console.log('Access allowed for role:', userRole);
      return NextResponse.next(); // Allow access
    } else {
      console.log('Unauthorized access for role:', userRole);
      // Redirect unauthorized users to their respective panel (or login)
      const redirectPath = protectedRoutes[userRole]?.[0] || '/login';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  } catch (error) {
    // Redirect to login if JWT verification fails
    console.error('JWT verification failed:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/beneficiary', '/service-provider', '/admin'], // Protected routes
};


