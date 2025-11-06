import { Router } from "express";
import { addBranchController, addCarController, addCarServiceRecordController, addEmployeeCarController, deleteCarByIdController, employeeDeleteController, employeeRegisterController, employeeUpdateController, getAllBranchesController, getAllCarsFromBranchController, getAllCustomersController, getAllEmployeeCarController, getAllEmployeeController, getAllEmployeesFromBranchController, getAllRentalsController, getAllServiceHistoryController, getAvailableCarsController, getBranchByIdController, getCarByIdController, getCarController, getCustomerByIdController, getEmployeeByIdController, getNotWorkingEmployeeController, getServiceHistoryByCarIdController, managerLoginController, managerLogoutController, managerProfileController, releveCarFromMaintenanceController, removeEmployeeCarController, updateBranchController, updateCarByIdController } from "../controllers/manager.controller.js";
import { managerAuthMiddleware } from "../middlewares/managerAuth.middleware.js";

const router = Router();

router.post("/register", managerAuthMiddleware, employeeRegisterController)
router.post("/login", managerLoginController)
router.get("/logout", managerAuthMiddleware, managerLogoutController)
router.get("/profile", managerAuthMiddleware, managerProfileController)
router.patch("/update", managerAuthMiddleware, employeeUpdateController)
router.delete("/delete/:id", managerAuthMiddleware, employeeDeleteController)

router.post("/add/branch", managerAuthMiddleware, addBranchController)
router.get("/get/branch", managerAuthMiddleware, getAllBranchesController)
router.get("/get/branch/:id", managerAuthMiddleware, getBranchByIdController)
router.patch("/update/branch/:id", managerAuthMiddleware, updateBranchController)

router.get("/get/branch/car/:id", managerAuthMiddleware, getAllCarsFromBranchController)
router.get("/get/branch/employee/:id", managerAuthMiddleware, getAllEmployeesFromBranchController)

router.get("/get/customer", managerAuthMiddleware, getAllCustomersController)
router.get("/get/customer/:id", managerAuthMiddleware, getCustomerByIdController)

router.get("/get/employee", managerAuthMiddleware, getAllEmployeeController)
router.get("/get/employee/:id", managerAuthMiddleware, getEmployeeByIdController)

router.post("/add/car", managerAuthMiddleware, addCarController)
router.get("/get/car", managerAuthMiddleware, getCarController)
router.get("/get/car/:id", managerAuthMiddleware, getCarByIdController)
router.patch("/update/car/:id", managerAuthMiddleware, updateCarByIdController)
router.delete("/delete/car/:id", managerAuthMiddleware, deleteCarByIdController)

router.get("/get/available/employees", managerAuthMiddleware, getNotWorkingEmployeeController)
router.get("/get/available/cars", managerAuthMiddleware, getAvailableCarsController)
router.post("/add/employeecar", managerAuthMiddleware, addEmployeeCarController)
router.get("/get/employeecar", managerAuthMiddleware, getAllEmployeeCarController)
router.delete("/delete/employeecar/:cid/:eid", managerAuthMiddleware, removeEmployeeCarController)

router.post("/add/service", managerAuthMiddleware, addCarServiceRecordController)
router.get("/get/service", managerAuthMiddleware, getAllServiceHistoryController)
router.get("/get/service/:id", managerAuthMiddleware, getServiceHistoryByCarIdController)
router.patch("/update/service/:sId/:cId", managerAuthMiddleware, releveCarFromMaintenanceController)

router.get("/get/rental", managerAuthMiddleware, getAllRentalsController)


export default router;