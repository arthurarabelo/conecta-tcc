<?php

use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProposalController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/proposals', [ProposalController::class, 'index']);
Route::get('/proposals/{proposal}', [ProposalController::class, 'show']);

Route::get('/departments', function (Illuminate\Http\Request $request) {
    $allowed = ['id', 'name', 'code'];
    $sortBy  = in_array($request->query('sort_by'), $allowed) ? $request->query('sort_by') : 'name';
    $order   = $request->query('order', 'asc') === 'desc' ? 'desc' : 'asc';

    return response()->json(App\Models\Department::orderBy($sortBy, $order)->get());
});

Route::get('/knowledge-areas', function (Illuminate\Http\Request $request) {
    $allowed = ['id', 'name'];
    $sortBy  = in_array($request->query('sort_by'), $allowed) ? $request->query('sort_by') : 'name';
    $order   = $request->query('order', 'asc') === 'desc' ? 'desc' : 'asc';

    return response()->json(App\Models\KnowledgeArea::orderBy($sortBy, $order)->get());
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/proposals', [ProposalController::class, 'store']);
    Route::put('/proposals/{proposal}', [ProposalController::class, 'update']);
    Route::patch('/proposals/{proposal}', [ProposalController::class, 'update']);
    Route::delete('/proposals/{proposal}', [ProposalController::class, 'destroy']);

    Route::post('/proposals/{proposal}/apply', [ApplicationController::class, 'apply']);
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/{application}', [ApplicationController::class, 'show']);
    Route::patch('/applications/{application}/approve', [ApplicationController::class, 'approve']);
    Route::patch('/applications/{application}/reject', [ApplicationController::class, 'reject']);
});
