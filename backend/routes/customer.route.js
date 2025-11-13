import { Router } from "express";
import { addRentalController, completeMyPaymentController, customerLoginController, customerLogoutController, customerProfileController, customerRegisterController, customerUpdateController, deleteMyRentalController, getAvailableCarsController, getCarBookedDatesController, getMyPaymentsController, getMyRentalByIdController, getMyRentalHistoryController, getPaymentDetailsController } from "../controllers/customer.controller.js";
import { customerAuthMiddleware } from "../middlewares/customerAuth.middleware.js";

const router = Router();

router.post("/register", customerRegisterController)
router.post("/login", customerLoginController)
router.get("/logout", customerAuthMiddleware, customerLogoutController)
router.get("/profile", customerAuthMiddleware, customerProfileController)
router.patch("/update", customerAuthMiddleware, customerUpdateController)

router.get("/get/cars", customerAuthMiddleware, getAvailableCarsController)
router.get("/get/car/:carId/booked-dates", customerAuthMiddleware, getCarBookedDatesController)

router.post("/add/rental", customerAuthMiddleware, addRentalController)
router.get("/get/rentals", customerAuthMiddleware, getMyRentalHistoryController)
router.get("/get/rental/:id", customerAuthMiddleware, getMyRentalByIdController)
router.delete("/delete/rental/:rentalId", customerAuthMiddleware, deleteMyRentalController)

router.post("/add/payment", customerAuthMiddleware, completeMyPaymentController)
router.get("/get/payments", customerAuthMiddleware, getMyPaymentsController)
router.get("/get/payments/:paymentId", customerAuthMiddleware, getPaymentDetailsController)




export default router;
